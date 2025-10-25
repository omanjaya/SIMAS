<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\FaceTemplate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FaceRecognitionService
{
    protected string $apiBaseUrl;
    protected string $apiKey;

    public function __construct()
    {
        // Configuration from .env
        $this->apiBaseUrl = config('services.face_recognition.api_url', 'http://localhost:5000');
        $this->apiKey = config('services.face_recognition.api_key', '');
    }

    /**
     * Enroll face template for employee
     * 
     * @param int $employeeId
     * @param array $faceImages Array of base64 encoded images
     * @return array
     */
    public function enrollFace(int $employeeId, array $faceImages): array
    {
        try {
            $employee = Employee::findOrFail($employeeId);

            // Process multiple images for better accuracy
            $embeddings = [];
            
            foreach ($faceImages as $index => $imageData) {
                $embedding = $this->extractFaceEmbedding($imageData);
                
                if (!$embedding['success']) {
                    return [
                        'success' => false,
                        'message' => "Gagal memproses gambar ke-" . ($index + 1) . ": " . $embedding['message'],
                    ];
                }
                
                $embeddings[] = $embedding['embedding'];
            }

            // Average embeddings for better recognition
            $averagedEmbedding = $this->averageEmbeddings($embeddings);

            // Store in database (encrypted)
            $faceTemplate = FaceTemplate::updateOrCreate(
                ['employee_id' => $employeeId],
                [
                    'template_data' => encrypt(json_encode([
                        'embeddings' => $embeddings,
                        'averaged_embedding' => $averagedEmbedding,
                        'created_at' => now()->toIso8601String(),
                    ])),
                    'algorithm' => 'FaceNet', // or your chosen algorithm
                    'version' => '1.0',
                ]
            );

            return [
                'success' => true,
                'message' => 'Face template berhasil disimpan',
                'template_id' => $faceTemplate->id,
                'images_processed' => count($faceImages),
            ];

        } catch (\Exception $e) {
            Log::error('Face enrollment failed', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Gagal mendaftarkan wajah: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Verify face against stored template
     * 
     * @param int $employeeId
     * @param string $faceImage Base64 encoded image
     * @param float $threshold Similarity threshold (0-1)
     * @return array
     */
    public function verifyFace(int $employeeId, string $faceImage, float $threshold = 0.6): array
    {
        try {
            // Get stored template
            $faceTemplate = FaceTemplate::where('employee_id', $employeeId)->first();

            if (!$faceTemplate) {
                return [
                    'success' => false,
                    'verified' => false,
                    'message' => 'Face template tidak ditemukan. Silakan daftar wajah terlebih dahulu.',
                    'confidence' => 0,
                ];
            }

            // Extract embedding from input image
            $inputEmbedding = $this->extractFaceEmbedding($faceImage);

            if (!$inputEmbedding['success']) {
                return [
                    'success' => false,
                    'verified' => false,
                    'message' => $inputEmbedding['message'],
                    'confidence' => 0,
                ];
            }

            // Decrypt stored template
            $templateData = json_decode(decrypt($faceTemplate->template_data), true);
            $storedEmbedding = $templateData['averaged_embedding'];

            // Calculate similarity
            $similarity = $this->calculateCosineSimilarity(
                $inputEmbedding['embedding'],
                $storedEmbedding
            );

            $verified = $similarity >= $threshold;

            return [
                'success' => true,
                'verified' => $verified,
                'confidence' => round($similarity, 4),
                'threshold' => $threshold,
                'message' => $verified
                    ? 'Wajah berhasil diverifikasi'
                    : 'Wajah tidak cocok. Confidence: ' . round($similarity * 100, 2) . '%',
            ];

        } catch (\Exception $e) {
            Log::error('Face verification failed', [
                'employee_id' => $employeeId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'verified' => false,
                'message' => 'Gagal verifikasi wajah: ' . $e->getMessage(),
                'confidence' => 0,
            ];
        }
    }

    /**
     * Extract face embedding from image using external API
     */
    protected function extractFaceEmbedding(string $base64Image): array
    {
        try {
            // Remove data:image prefix if exists
            if (strpos($base64Image, 'data:image') === 0) {
                $base64Image = preg_replace('/^data:image\/\w+;base64,/', '', $base64Image);
            }

            $response = Http::timeout(30)
                ->withHeaders(['X-API-Key' => $this->apiKey])
                ->post($this->apiBaseUrl . '/extract-embedding', [
                    'image' => $base64Image,
                    'detect_liveness' => true, // Anti-spoofing
                ]);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'message' => 'Face recognition service error: ' . $response->body(),
                ];
            }

            $data = $response->json();

            if (!isset($data['embedding'])) {
                return [
                    'success' => false,
                    'message' => 'Tidak ada wajah yang terdeteksi dalam gambar',
                ];
            }

            // Check liveness (anti-spoofing)
            if (isset($data['is_live']) && !$data['is_live']) {
                return [
                    'success' => false,
                    'message' => 'Gambar terdeteksi sebagai foto/video, bukan wajah asli',
                ];
            }

            return [
                'success' => true,
                'embedding' => $data['embedding'],
                'face_detected' => true,
                'is_live' => $data['is_live'] ?? true,
            ];

        } catch (\Exception $e) {
            Log::error('Extract embedding failed', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Gagal memproses gambar: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Calculate cosine similarity between two embeddings
     */
    protected function calculateCosineSimilarity(array $embedding1, array $embedding2): float
    {
        if (count($embedding1) !== count($embedding2)) {
            throw new \InvalidArgumentException('Embeddings must have same dimension');
        }

        $dotProduct = 0;
        $magnitude1 = 0;
        $magnitude2 = 0;

        for ($i = 0; $i < count($embedding1); $i++) {
            $dotProduct += $embedding1[$i] * $embedding2[$i];
            $magnitude1 += $embedding1[$i] ** 2;
            $magnitude2 += $embedding2[$i] ** 2;
        }

        $magnitude1 = sqrt($magnitude1);
        $magnitude2 = sqrt($magnitude2);

        if ($magnitude1 == 0 || $magnitude2 == 0) {
            return 0;
        }

        return $dotProduct / ($magnitude1 * $magnitude2);
    }

    /**
     * Average multiple embeddings
     */
    protected function averageEmbeddings(array $embeddings): array
    {
        if (empty($embeddings)) {
            throw new \InvalidArgumentException('Embeddings array cannot be empty');
        }

        $dimension = count($embeddings[0]);
        $averaged = array_fill(0, $dimension, 0);

        foreach ($embeddings as $embedding) {
            for ($i = 0; $i < $dimension; $i++) {
                $averaged[$i] += $embedding[$i];
            }
        }

        $count = count($embeddings);
        for ($i = 0; $i < $dimension; $i++) {
            $averaged[$i] /= $count;
        }

        return $averaged;
    }

    /**
     * Health check for face recognition service
     */
    public function healthCheck(): array
    {
        try {
            $response = Http::timeout(5)
                ->get($this->apiBaseUrl . '/health');

            return [
                'available' => $response->successful(),
                'status' => $response->status(),
                'message' => $response->successful() ? 'Service available' : 'Service unavailable',
            ];
        } catch (\Exception $e) {
            return [
                'available' => false,
                'status' => 0,
                'message' => 'Cannot connect to face recognition service: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Process an image file to extract face template data
     * @deprecated Use enrollFace instead
     */
    public function processImage(string $imagePath): string
    {
        // Check if the image exists in storage
        if (Storage::exists($imagePath)) {
            // In a real implementation, you would decode the file and use face recognition library
            // For now, we'll return a basic representation
            $fileContent = Storage::get($imagePath);

            // This would be where you use your face recognition library (e.g., OpenCV, Face++ API, etc.)
            return $this->extractFaceTemplate($fileContent);
        }

        // If it's a base64 encoded image
        if (str_starts_with($imagePath, 'data:image')) {
            $imageData = base64_decode(substr($imagePath, strpos($imagePath, ',') + 1));
            if ($imageData === false) {
                throw new \Exception('Invalid base64 image data');
            }

            return $this->extractFaceTemplate($imageData);
        }

        throw new \Exception("Image file not found: {$imagePath}");
    }

    /**
     * Extract face template from image data
     * @deprecated Use enrollFace instead
     */
    private function extractFaceTemplate(string $imageData): string
    {
        // This is a simplified placeholder implementation
        // In a real application, you would use a face recognition library
        // to extract facial landmarks and create a face template

        // For now, we'll return a hash of the image data as a placeholder
        return hash('sha256', $imageData);
    }
}
