'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCompanySchema, type CreateCompanyInput } from '@/lib/validations/company'
import { generateSlug } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function CreateCompanyDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      website: '',
      logo: '',
    },
  })

  const companyName = watch('name')

  // Auto-generate slug from company name
  useEffect(() => {
    if (companyName) {
      const slug = generateSlug(companyName)
      setValue('slug', slug)
    }
  }, [companyName, setValue])

  // Open dialog when new=true is in URL
  useEffect(() => {
    const isNew = searchParams.get('new') === 'true'
    setOpen(isNew)
  }, [searchParams])

  const handleClose = () => {
    setOpen(false)
    reset()
    // Remove ?new=true from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('new')
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/dashboard${newUrl}`)
  }

  const onSubmit = async (data: CreateCompanyInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create company')
      }

      const result = await response.json()
      toast.success('Company created successfully!')
      handleClose()
      // Refresh the page to show the new company
      router.refresh()
      // Navigate to the new company's builder
      router.push(`/${result.data.slug}/builder`)
    } catch (error) {
      console.error('Error creating company:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create company')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Create a new company to start building your careers page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Acme Inc."
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="acme-inc"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              This will be used in your careers page URL: /your-slug
            </p>
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Tell us about your company..."
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              type="url"
              {...register('logo')}
              placeholder="https://example.com/logo.png"
              disabled={isSubmitting}
            />
            {errors.logo && (
              <p className="text-sm text-destructive">{errors.logo.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

