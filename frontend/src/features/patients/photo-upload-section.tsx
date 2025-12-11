import { memo, RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Fieldset, Legend, FieldGroup, Field, Label, Description } from '@/components/ui/fieldset'
import { API_BASE_URL } from '@/lib/constants'
import PhotoPreview from './photo-preview'

interface PhotoUploadSectionProps {
  photoFile: File | null
  photoPreview: string | null
  currentPhotoUrl: string | undefined
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: () => void
  fileInputRef: RefObject<HTMLInputElement>
}

function PhotoUploadSection({
  photoFile,
  photoPreview,
  currentPhotoUrl,
  onPhotoChange,
  onRemovePhoto,
  fileInputRef,
}: PhotoUploadSectionProps) {

  return (
    <Fieldset>
      <Legend>Patient Photo</Legend>
      <FieldGroup>
        <Field>
          <Label>Photo</Label>
          <div className='space-y-4'>
            {/* Photo Preview */}
            {(photoPreview || currentPhotoUrl) && (
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <PhotoPreview 
                    photoPreview={photoPreview}
                    currentPhotoUrl={currentPhotoUrl}
                    apiBaseUrl={API_BASE_URL}
                  />
                </div>
                {photoFile && (
                  <Button
                    type='button'
                    onClick={onRemovePhoto}
                    outline
                  >
                    Remove New Photo
                  </Button>
                )}
              </div>
            )}
            
            {/* File Input */}
            <div className='flex items-center gap-4'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/jpg,image/png'
                onChange={onPhotoChange}
                className='block w-full text-sm text-neutral-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-neutral-100 file:text-neutral-700
                  hover:file:bg-neutral-200
                  file:cursor-pointer'
              />
            </div>
            <Description>
              Upload a patient photo (JPEG or PNG, max 5MB). This will replace any existing photo.
            </Description>
          </div>
        </Field>
      </FieldGroup>
    </Fieldset>
  )
}

export default memo(PhotoUploadSection)
