"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import Color from "color";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerOutput,
} from "@/components/ui/shadcn-io/color-picker";
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

interface ColorPickerFieldProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function ColorPickerField({
  value,
  onChange,
  disabled,
  placeholder,
}: ColorPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  // Convert hex to display color safely
  const displayColor = (() => {
    try {
      return value ? Color(value).hex() : placeholder || "#000000";
    } catch {
      return placeholder || "#000000";
    }
  })();

  // Handle color picker change (receives RGBA array)
  const handleColorChange = useCallback(
    (rgba: Parameters<typeof Color.rgb>[0]) => {
      try {
        const color = Color.rgb(rgba);
        const hex = color.hex();
        setInputValue(hex);
        onChange(hex);
      } catch {
        // Ignore invalid colors
      }
    },
    [onChange]
  );

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Only update if valid hex
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  // Sync input value when external value changes
  const handleInputBlur = () => {
    if (value) {
      setInputValue(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="h-10 w-14 sm:h-9 sm:w-12 rounded-md border border-input shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: displayColor }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <ColorPicker
            value={displayColor}
            onChange={handleColorChange}
            className="gap-3"
          >
            <ColorPickerSelection className="h-32 rounded-lg" />
            <ColorPickerHue />
            <div className="flex items-center gap-2">
              <ColorPickerEyeDropper />
              <ColorPickerOutput />
            </div>
            <ColorPickerFormat />
          </ColorPicker>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        className="flex-1 font-mono text-sm"
      />
    </div>
  );
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
    control,
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

      // If slug changed, redirect to the new URL
      if (result.data.slug !== companySlug) {
        router.push(`/${result.data.slug}/settings`);
      } else {
        router.refresh();
      }
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
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
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Company name is required" })}
                disabled={isSubmitting}
                className="w-full"
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
                className="w-full"
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
                className="w-full resize-none"
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
                className="w-full"
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
                className="w-full"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Brand Color</Label>
                <Controller
                  name="primaryColor"
                  control={control}
                  render={({ field }) => (
                    <ColorPickerField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="#0F172A"
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Used for buttons and accents on your public careers page.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Brand Color</Label>
                <Controller
                  name="secondaryColor"
                  control={control}
                  render={({ field }) => (
                    <ColorPickerField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      placeholder="#38BDF8"
                    />
                  )}
                />
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
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Used as the default background image for the hero section on
                your public careers page.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive text-lg sm:text-xl">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-sm">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <h3 className="text-sm font-semibold">Delete Company</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  className="w-full sm:w-auto"
                >
                  <PiTrash className="mr-2 h-4 w-4" />
                  Delete Company
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <PiWarning className="h-5 w-5 text-destructive shrink-0" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <div className="pt-2 space-y-2">
                    <AlertDialogDescription className="text-sm">
                      This action cannot be undone. This will permanently delete
                      the company <strong>{company.name}</strong> and all of its
                      data including:
                    </AlertDialogDescription>
                    <ul className="ml-4 list-disc space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <li>All job postings</li>
                      <li>All job applications</li>
                      <li>Careers page and all sections</li>
                      <li>Company settings and branding</li>
                    </ul>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel
                    disabled={isDeleting}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
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
