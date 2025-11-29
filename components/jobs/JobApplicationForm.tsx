"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createApplicationSchema,
  type CreateApplicationInput,
} from "@/lib/validations/application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PiSpinner, PiUpload } from "react-icons/pi";

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companySlug: string;
  companyId: string;
}

export function JobApplicationForm({
  jobId,
  jobTitle,
  companySlug,
  companyId,
}: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateApplicationInput>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: {
      jobId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      resumeUrl: "",
      coverLetter: "",
      linkedinUrl: "",
      portfolioUrl: "",
    },
  });

  const onSubmit = async (data: CreateApplicationInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      reset();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input id="firstName" {...register("firstName")} placeholder="John" />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input id="lastName" {...register("lastName")} placeholder="Doe" />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john.doe@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="resumeUrl">
          Resume URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="resumeUrl"
          type="url"
          {...register("resumeUrl")}
          placeholder="https://example.com/resume.pdf"
        />
        {errors.resumeUrl && (
          <p className="text-sm text-destructive">{errors.resumeUrl.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Upload your resume to a file hosting service and paste the URL here
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
        <Input
          id="linkedinUrl"
          type="url"
          {...register("linkedinUrl")}
          placeholder="https://linkedin.com/in/johndoe"
        />
        {errors.linkedinUrl && (
          <p className="text-sm text-destructive">
            {errors.linkedinUrl.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolioUrl">Portfolio URL</Label>
        <Input
          id="portfolioUrl"
          type="url"
          {...register("portfolioUrl")}
          placeholder="https://johndoe.dev"
        />
        {errors.portfolioUrl && (
          <p className="text-sm text-destructive">
            {errors.portfolioUrl.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverLetter">Cover Letter</Label>
        <Textarea
          id="coverLetter"
          {...register("coverLetter")}
          placeholder="Tell us why you're interested in this position..."
          rows={6}
        />
        {errors.coverLetter && (
          <p className="text-sm text-destructive">
            {errors.coverLetter.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <PiSpinner className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <PiUpload className="mr-2 h-4 w-4" />
            Submit Application
          </>
        )}
      </Button>
    </form>
  );
}
