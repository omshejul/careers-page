"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo: string;
  primaryColor?: string;
  secondaryColor?: string;
  brandBannerUrl?: string;
}

interface SettingsClientProps {
  companyId: string;
  companySlug: string;
  initialCompany: Company;
}

export function SettingsClient({
  companyId,
  companySlug,
  initialCompany,
}: SettingsClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState(initialCompany);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Company>({
    defaultValues: company,
  });

  const onSubmit = async (data: Company) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update company");
      }

      const result = await response.json();
      setCompany(result.data);
      toast.success("Company settings updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update company"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your company information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your company details and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Company name is required" })}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...register("slug", { required: "Slug is required" })}
                disabled={isSubmitting}
                placeholder="company-name"
              />
              <p className="text-xs text-muted-foreground">
                Your careers page will be available at /{companySlug}
              </p>
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={4}
                disabled={isSubmitting}
                placeholder="Tell us about your company..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...register("website")}
                disabled={isSubmitting}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                {...register("logo")}
                disabled={isSubmitting}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Brand Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    className="h-9 w-12 p-1"
                    {...register("primaryColor")}
                    disabled={isSubmitting}
                  />
                  <Input
                    type="text"
                    placeholder="#0F172A"
                    {...register("primaryColor")}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for buttons and accents on your public careers page.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Brand Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    className="h-9 w-12 p-1"
                    {...register("secondaryColor")}
                    disabled={isSubmitting}
                  />
                  <Input
                    type="text"
                    placeholder="#38BDF8"
                    {...register("secondaryColor")}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for subtle highlights and backgrounds.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandBannerUrl">Hero Banner Image URL</Label>
              <Input
                id="brandBannerUrl"
                type="url"
                {...register("brandBannerUrl")}
                disabled={isSubmitting}
                placeholder="https://example.com/hero-banner.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Used as the default background image for the hero section on
                your public careers page.
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
