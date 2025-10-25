# 📧 BACKEND EMAIL VERIFICATION

## 📋 OVERVIEW

Email verification system (after login) dengan reminder banner.

---

## 🔧 UPDATE USER MODEL

**File**: `app/Models/User.php`

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable;

    // ... rest of the code
}
```

---

## 🎯 VERIFICATION CONTROLLER

**File**: `app/Http/Controllers/Auth/VerificationController.php`

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;

class VerificationController extends Controller
{
    /**
     * Verify email
     *
     * GET /api/email/verify/{id}/{hash}
     */
    public function verify(Request $request, $id, $hash)
    {
        $user = \App\Models\User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json([
                'message' => 'Invalid verification link'
            ], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified'
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json([
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Resend verification email
     *
     * POST /api/email/verification-notification
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified'
            ]);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification email sent'
        ]);
    }
}
```

---

## 🛣️ ROUTES

```php
Route::middleware(['auth:sanctum'])->group(function () {
    // Email verification
    Route::post('/email/verification-notification', [VerificationController::class, 'resend']);
    Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
        ->name('verification.verify');
});
```

---

**Next**: Lanjut ke [06_FRONTEND_IMPORT.md](./06_FRONTEND_IMPORT.md)
