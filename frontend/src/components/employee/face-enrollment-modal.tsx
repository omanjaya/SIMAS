"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FaceEnrollmentModalProps {
  employeeId: number
  currentStatus: 'enrolled' | 'not_enrolled' | 'pending'
  lastEnrolled?: string
  onEnrollmentComplete?: () => void
}

export function FaceEnrollmentModal({ 
  employeeId, 
  currentStatus, 
  lastEnrolled,
  onEnrollmentComplete 
}: FaceEnrollmentModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'webcam' | 'upload'>('webcam')
  const [isCapturing, setIsCapturing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const { toast } = useToast()

  // TODO: Implement webcam capture logic
  const handleWebcamCapture = async () => {
    setIsCapturing(true)
    try {
      // Placeholder: Actual webcam integration
      // Use navigator.mediaDevices.getUserMedia()
      toast({
        title: 'Coming Soon',
        description: 'Webcam capture will be implemented with face-api.js',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access camera',
        variant: 'destructive',
      })
    } finally {
      setIsCapturing(false)
    }
  }

  // TODO: Implement file upload logic
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Create FormData and call API
      const formData = new FormData()
      formData.append('image', file)
      formData.append('employee_id', employeeId.toString())

      // TODO: Call actual API endpoint
      // await faceTemplateService.uploadTemplate(formData)

      toast({
        title: 'Success',
        description: 'Face template uploaded successfully',
      })

      onEnrollmentComplete?.()
      setOpen(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload face template',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={currentStatus === 'enrolled' ? 'outline' : 'default'}>
          <Camera className="mr-2 h-4 w-4" />
          {currentStatus === 'enrolled' ? 'Update Face' : 'Enroll Face'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Face Enrollment</DialogTitle>
          <DialogDescription>
            Capture or upload your face photo for attendance verification
          </DialogDescription>
        </DialogHeader>

        {/* Current Status Alert */}
        {currentStatus === 'enrolled' && lastEnrolled && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Face enrolled on {new Date(lastEnrolled).toLocaleDateString()}.
              You can update it anytime.
            </AlertDescription>
          </Alert>
        )}

        {currentStatus === 'not_enrolled' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No face template found. Please enroll to use face recognition for
              attendance.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="webcam">
              <Camera className="mr-2 h-4 w-4" />
              Webcam
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webcam" className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 
border-dashed rounded-lg p-8 min-h-[300px]">
              {!capturedImage ? (
                <>
                  <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Position your face within the frame and click capture
                  </p>
                  <Button 
                    onClick={handleWebcamCapture} 
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing Camera...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Start Camera
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <img src={capturedImage} alt="Captured" className="max-w-full 
rounded-lg" />
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setCapturedImage(null)}>
                      Retake
                    </Button>
                    <Button>
                      Submit
                    </Button>
                  </div>
                </>
              )}
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Tips:</strong> Ensure good lighting, face the camera directly,
                remove glasses/mask if possible, and maintain neutral expression.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 
border-dashed rounded-lg p-8 min-h-[300px]">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Upload a clear photo of your face (JPG, PNG)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileUpload}
                className="hidden"
                id="face-upload"
                disabled={isUploading}
              />
              <label htmlFor="face-upload">
                <Button asChild disabled={isUploading}>
                  <span>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                <strong>Requirements:</strong> Face must be clearly visible, well-lit,
                front-facing, and minimum 500x500 pixels.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}