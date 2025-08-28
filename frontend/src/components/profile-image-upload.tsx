import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProfileImageUploadProps {
  currentImage?: string
  userName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  onImageChange?: (imageUrl: string) => void
}

export function ProfileImageUpload({
  currentImage,
  userName,
  className,
  size = 'md',
  onImageChange,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
  }

  const buttonSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    
    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)

      // TODO: Upload to server when endpoint is available
      // For now, just simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Profile image updated successfully')
      if (onImageChange && previewImage) {
        onImageChange(previewImage)
      }
    } catch (error) {
      toast.error('Failed to upload image')
      setPreviewImage(null)
    } finally {
      setIsUploading(false)
    }
  }

  const initials = userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn('relative', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={previewImage || currentImage} 
          alt={userName}
        />
        <AvatarFallback className={size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-sm'}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="absolute -bottom-1 -right-1">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="sr-only"
          id="profile-image-upload"
          disabled={isUploading}
        />
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "rounded-full p-0 shadow-md",
            buttonSizeClasses[size]
          )}
          asChild
          disabled={isUploading}
        >
          <label htmlFor="profile-image-upload" className="cursor-pointer">
            {isUploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
          </label>
        </Button>
      </div>

      {/* Upload instruction tooltip */}
      {size === 'lg' && (
        <div className="mt-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            asChild
          >
            <label htmlFor="profile-image-upload" className="cursor-pointer flex items-center">
              <Upload className="h-3 w-3 mr-1" />
              Click to upload new image
            </label>
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG up to 5MB
          </p>
        </div>
      )}
    </div>
  )
}