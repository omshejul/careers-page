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
import { PiSpinner, PiSparkle } from "react-icons/pi";
import { faker } from "@faker-js/faker";
import { motion } from "framer-motion";

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
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Generate random job data
  const generateRandomData = async () => {
    setIsGenerating(true);

    // Add a small delay for animation effect
    await new Promise((resolve) => setTimeout(resolve, 300));

    const jobTitles = [
      "Senior Software Engineer",
      "Full Stack Developer",
      "Product Manager",
      "UX Designer",
      "Data Scientist",
      "DevOps Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Mobile App Developer",
      "QA Engineer",
      "Technical Lead",
      "Software Architect",
      "Machine Learning Engineer",
      "Cloud Engineer",
      "Security Engineer",
    ];

    const departments = [
      "Engineering",
      "Product",
      "Design",
      "Data Science",
      "Operations",
      "Marketing",
      "Sales",
      "Customer Success",
    ];

    const employmentTypes = [
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
    ];
    const jobTypes = ["Remote", "Hybrid", "On-site"];
    const experienceLevels = [
      "Entry Level",
      "Mid Level",
      "Senior Level",
      "Executive",
    ];
    const workPolicies = [
      "Remote-first",
      "Hybrid-flexible",
      "Office-based",
      "Fully remote",
    ];

    const randomTitle = faker.helpers.arrayElement(jobTitles);
    const randomSlug = generateSlug(randomTitle);
    const randomDepartment = faker.helpers.arrayElement(departments);
    const randomLocation = `${faker.location.city()}, ${faker.location.state({
      abbreviated: true,
    })}`;
    const randomEmploymentType = faker.helpers.arrayElement(employmentTypes);
    const randomJobType = faker.helpers.arrayElement(jobTypes);
    const randomExperienceLevel = faker.helpers.arrayElement(experienceLevels);
    const randomWorkPolicy = faker.helpers.arrayElement(workPolicies);

    // Generate realistic salary range
    const minSalary = faker.number.int({ min: 60, max: 200 });
    const maxSalary = minSalary + faker.number.int({ min: 20, max: 80 });
    const salaryRange = `$${minSalary},000 - $${maxSalary},000`;

    // Generate realistic job description
    const description = `## About the Role

We are looking for a talented ${randomTitle} to join our ${randomDepartment} team. This is an exciting opportunity to work on cutting-edge projects and make a significant impact.

## Responsibilities

${faker.lorem.paragraphs(3, "\n\n")}

## Requirements

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

## Benefits

- Competitive salary and equity package
- Comprehensive health, dental, and vision insurance
- Flexible work arrangements
- Professional development opportunities
- ${faker.lorem.sentence()}

## How to Apply

${faker.lorem.paragraph()}`;

    // Generate expiration date (30-90 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + faker.number.int({ min: 30, max: 90 })
    );
    const expiresAtString = expiresAt.toISOString().slice(0, 16);

    // Fill all form fields
    setValue("title", randomTitle);
    setValue("slug", randomSlug);
    setValue("description", description);
    setValue("department", randomDepartment);
    setValue("location", randomLocation);
    setValue("employmentType", randomEmploymentType);
    setValue("jobType", randomJobType);
    setValue("experienceLevel", randomExperienceLevel);
    setValue("workPolicy", randomWorkPolicy);
    setValue("salaryRange", salaryRange);
    setValue("expiresAt", expiresAtString);
    setValue("published", faker.datatype.boolean({ probability: 0.8 }));

    setIsGenerating(false);
    toast.success("Random job data generated!");
  };

  const onSubmit = async (data: CreateJobInput) => {
    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/companies/${companyId}/jobs/${jobId}`
        : `/api/companies/${companyId}/jobs`;

      const method = isEdit ? "PATCH" : "POST";

      // Convert datetime-local format to ISO string
      let expiresAtISO: string | undefined = undefined;
      if (data.expiresAt && data.expiresAt.trim() !== "") {
        // datetime-local format is YYYY-MM-DDTHH:mm, need to convert to ISO
        const date = new Date(data.expiresAt);
        if (!isNaN(date.getTime())) {
          expiresAtISO = date.toISOString();
        }
      }

      const body: any = {
        ...data,
        expiresAt: expiresAtISO,
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1" />
        <motion.div
          initial={{ filter: "blur(0px)" }}
          whileHover={{ scale: 1.05, filter: "blur(0px)" }}
          whileTap={{ scale: 0.95, filter: "blur(0px)" }}
          animate={
            isGenerating
              ? { rotate: [0, 10, -10, 10, -10, 0], filter: "blur(0px)" }
              : { filter: "blur(0px)" }
          }
          transition={{ duration: 0.3 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={generateRandomData}
            disabled={isGenerating || isSubmitting}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <PiSpinner className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <PiSparkle className="h-4 w-4" />
                Generate Random Data
              </>
            )}
          </Button>
        </motion.div>
      </div>

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
