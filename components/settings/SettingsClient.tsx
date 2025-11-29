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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PiTrash, PiWarning } from "react-icons/pi";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete company");
      }

      toast.success("Company deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete company"
      );
      setIsDeleting(false);
      setDeleteDialogOpen(false);
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

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold">Delete Company</h3>
              <p className="text-sm text-muted-foreground">
                Once you delete a company, there is no going back. This will
                permanently delete the company, all jobs, applications, and
                careers page data.
              </p>
            </div>
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <PiTrash className="mr-2 h-4 w-4" />
                  Delete Company
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <PiWarning className="h-5 w-5 text-destructive" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <div className="pt-2 space-y-2">
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the company <strong>{company.name}</strong> and all of its
                      data including:
                    </AlertDialogDescription>
                    <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                      <li>All job postings</li>
                      <li>All job applications</li>
                      <li>Careers page and all sections</li>
                      <li>Company settings and branding</li>
                    </ul>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete Company"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
