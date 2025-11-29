'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateCareersPageSchema, type UpdateCareersPageInput } from '@/lib/validations/career'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface SEOSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  initialData: {
    seoTitle: string
    seoDescription: string
  }
  onUpdated: () => void
}

export function SEOSettingsDialog({
  open,
  onOpenChange,
  companyId,
  initialData,
  onUpdated,
}: SEOSettingsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateCareersPageInput>({
    resolver: zodResolver(updateCareersPageSchema),
    defaultValues: {
      seoTitle: initialData.seoTitle,
      seoDescription: initialData.seoDescription,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        seoTitle: initialData.seoTitle,
        seoDescription: initialData.seoDescription,
      })
    }
  }, [open, initialData, reset])

  const onSubmit = async (data: UpdateCareersPageInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/careers/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update SEO settings')
      }

      toast.success('SEO settings updated successfully!')
      onOpenChange(false)
      onUpdated()
    } catch (error) {
      console.error('Error updating SEO settings:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update SEO settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit SEO Settings</DialogTitle>
          <DialogDescription>
            Optimize your careers page for search engines
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              {...register('seoTitle')}
              placeholder="Careers at Company Name"
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 50-60 characters
            </p>
            {errors.seoTitle && (
              <p className="text-sm text-destructive">{errors.seoTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea
              id="seoDescription"
              {...register('seoDescription')}
              placeholder="Join our team and help build amazing products..."
              maxLength={300}
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 150-160 characters
            </p>
            {errors.seoDescription && (
              <p className="text-sm text-destructive">{errors.seoDescription.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

