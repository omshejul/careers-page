"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createJobSchema,
  updateJobSchema,
  type CreateJobInput,
  type UpdateJobInput,
} from "@/lib/validations/job";
import { generateSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PiSpinner } from "react-icons/pi";

interface JobFormProps {
  companyId: string;
  companySlug: string;
  initialData?: Partial<CreateJobInput>;
  isEdit?: boolean;
  jobId?: string;
}

export function JobForm({
  companyId,
  companySlug,
  initialData,
  isEdit = false,
  jobId,
}: JobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateJobInput>({
    resolver: zodResolver(isEdit ? updateJobSchema : createJobSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      workPolicy: initialData?.workPolicy || "",
      location: initialData?.location || "",
      department: initialData?.department || "",
      employmentType: initialData?.employmentType || "",
      experienceLevel: initialData?.experienceLevel || "",
      jobType: initialData?.jobType || "",
      salaryRange: initialData?.salaryRange || "",
      published: initialData?.published ?? true,
      expiresAt: initialData?.expiresAt
        ? new Date(initialData.expiresAt).toISOString().slice(0, 16)
        : "",
    },
  });

  const title = watch("title");
  const published = watch("published");
  const employmentType = watch("employmentType");
  const jobType = watch("jobType");
  const experienceLevel = watch("experienceLevel");

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !isEdit) {
      const slug = generateSlug(title);
      setValue("slug", slug);
    }
  }, [title, isEdit, setValue]);

  const onSubmit = async (data: CreateJobInput) => {
    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/companies/${companyId}/jobs/${jobId}`
        : `/api/companies/${companyId}/jobs`;

      const method = isEdit ? "PATCH" : "POST";

      const body: any = {
        ...data,
        expiresAt: data.expiresAt
          ? new Date(data.expiresAt).toISOString()
          : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save job");
      }

      toast.success(
        isEdit ? "Job updated successfully" : "Job created successfully"
      );
      router.push(`/${companySlug}/jobs`);
      router.refresh();
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save job"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">
            Job Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="e.g., Senior Software Engineer"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="slug"
            {...register("slug")}
            placeholder="e.g., senior-software-engineer"
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter job description..."
          rows={10}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="e.g., San Francisco, CA"
          />
          {errors.location && (
            <p className="text-sm text-destructive">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            {...register("department")}
            placeholder="e.g., Engineering"
          />
          {errors.department && (
            <p className="text-sm text-destructive">
              {errors.department.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment Type</Label>
          <Select
            onValueChange={(value) => setValue("employmentType", value)}
            value={employmentType || ""}
          >
            <SelectTrigger id="employmentType">
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobType">Job Type</Label>
          <Select
            onValueChange={(value) => setValue("jobType", value)}
            value={jobType || ""}
          >
            <SelectTrigger id="jobType">
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="On-site">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="workPolicy">Work Policy</Label>
          <Input
            id="workPolicy"
            {...register("workPolicy")}
            placeholder="e.g., Remote-first"
          />
          {errors.workPolicy && (
            <p className="text-sm text-destructive">
              {errors.workPolicy.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Experience Level</Label>
          <Select
            onValueChange={(value) => setValue("experienceLevel", value)}
            value={experienceLevel || ""}
          >
            <SelectTrigger id="experienceLevel">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entry Level">Entry Level</SelectItem>
              <SelectItem value="Mid Level">Mid Level</SelectItem>
              <SelectItem value="Senior Level">Senior Level</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salaryRange">Salary Range</Label>
        <Input
          id="salaryRange"
          {...register("salaryRange")}
          placeholder="e.g., $100,000 - $150,000"
        />
        {errors.salaryRange && (
          <p className="text-sm text-destructive">
            {errors.salaryRange.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expires At (Optional)</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          {...register("expiresAt")}
        />
        {errors.expiresAt && (
          <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={(checked) => setValue("published", checked)}
        />
        <Label htmlFor="published" className="cursor-pointer">
          Published
        </Label>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <PiSpinner className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEdit ? (
            "Update Job"
          ) : (
            "Create Job"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
