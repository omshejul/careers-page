"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateSectionSchema,
  type UpdateSectionInput,
} from "@/lib/validations/career";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { TypedSection } from "@/types/section";
import { PiPlus, PiTrash } from "react-icons/pi";

interface EditSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  section: TypedSection;
  onSectionUpdated: () => void;
}

export function EditSectionDialog({
  open,
  onOpenChange,
  companyId,
  section,
  onSectionUpdated,
}: EditSectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateSectionInput & { enabled: boolean }>({
    resolver: zodResolver(updateSectionSchema) as any,
    defaultValues: {
      enabled: section.enabled,
      data: section.data as any,
    },
  });

  const enabled = watch("enabled");

  useEffect(() => {
    if (section) {
      reset({
        enabled: section.enabled,
        data: section.data as any,
      });
    }
  }, [section, reset]);

  const onSubmit = async (data: UpdateSectionInput & { enabled: boolean }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/careers/${companyId}/sections/${section.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled: data.enabled,
            data: data.data,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update section");
      }

      toast.success("Section updated successfully!");
      onOpenChange(false);
      onSectionUpdated();
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update section"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSectionFields = () => {
    switch (section.type) {
      case "HERO":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("data.title", { required: "Title is required" })}
                defaultValue={(section.data as any).title}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                {...register("data.tagline")}
                defaultValue={(section.data as any).tagline}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bannerUrl">Banner URL</Label>
              <Input
                id="bannerUrl"
                type="url"
                {...register("data.bannerUrl")}
                defaultValue={(section.data as any).bannerUrl}
                disabled={isSubmitting}
              />
            </div>
          </>
        );
      case "ABOUT":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("data.title", { required: "Title is required" })}
                defaultValue={(section.data as any).title}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                {...register("data.content", {
                  required: "Content is required",
                })}
                defaultValue={(section.data as any).content}
                rows={6}
                disabled={isSubmitting}
              />
            </div>
          </>
        );
      case "JOBS_LIST":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("data.title", { required: "Title is required" })}
                defaultValue={(section.data as any).title}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                {...register("data.subtitle")}
                defaultValue={(section.data as any).subtitle}
                disabled={isSubmitting}
              />
            </div>
          </>
        );
      case "CULTURE_VIDEO":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("data.title", { required: "Title is required" })}
                defaultValue={(section.data as any).title}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input
                id="videoUrl"
                {...register("data.videoUrl", {
                  required: "Video URL is required",
                })}
                defaultValue={(section.data as any).videoUrl}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("data.description")}
                defaultValue={(section.data as any).description}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </>
        );
      case "VALUES":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("data.title", { required: "Title is required" })}
                defaultValue={(section.data as any).title}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Values</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentValues = (watch("data.values") as any[]) || [];
                    setValue("data.values", [
                      ...currentValues,
                      { title: "", description: "", icon: "" },
                    ]);
                  }}
                >
                  <PiPlus className="mr-1 h-3 w-3" />
                  Add Value
                </Button>
              </div>
              {((watch("data.values") as any[]) || []).map(
                (_: any, index: number) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Value {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentValues =
                            (watch("data.values") as any[]) || [];
                          setValue(
                            "data.values",
                            currentValues.filter(
                              (_: any, i: number) => i !== index
                            )
                          );
                        }}
                      >
                        <PiTrash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Value title"
                        {...register(`data.values.${index}.title`)}
                        defaultValue={
                          (section.data as any).values?.[index]?.title || ""
                        }
                        disabled={isSubmitting}
                      />
                      <Textarea
                        placeholder="Value description"
                        rows={2}
                        {...register(`data.values.${index}.description`)}
                        defaultValue={
                          (section.data as any).values?.[index]?.description ||
                          ""
                        }
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder="Icon URL (optional)"
                        {...register(`data.values.${index}.icon`)}
                        defaultValue={
                          (section.data as any).values?.[index]?.icon || ""
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )
              )}
              {(!watch("data.values") ||
                (watch("data.values") as any[]).length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No values added yet. Click "Add Value" to get started.
                </p>
              )}
            </div>
          </>
        );
      case "BENEFITS":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("data.title", { required: "Title is required" })}
                defaultValue={(section.data as any).title}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Benefits</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentBenefits =
                      (watch("data.benefits") as any[]) || [];
                    setValue("data.benefits", [
                      ...currentBenefits,
                      { title: "", description: "", icon: "" },
                    ]);
                  }}
                >
                  <PiPlus className="mr-1 h-3 w-3" />
                  Add Benefit
                </Button>
              </div>
              {((watch("data.benefits") as any[]) || []).map(
                (_: any, index: number) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Benefit {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentBenefits =
                            (watch("data.benefits") as any[]) || [];
                          setValue(
                            "data.benefits",
                            currentBenefits.filter(
                              (_: any, i: number) => i !== index
                            )
                          );
                        }}
                      >
                        <PiTrash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Benefit title"
                        {...register(`data.benefits.${index}.title`)}
                        defaultValue={
                          (section.data as any).benefits?.[index]?.title || ""
                        }
                        disabled={isSubmitting}
                      />
                      <Textarea
                        placeholder="Benefit description"
                        rows={2}
                        {...register(`data.benefits.${index}.description`)}
                        defaultValue={
                          (section.data as any).benefits?.[index]
                            ?.description || ""
                        }
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder="Icon URL (optional)"
                        {...register(`data.benefits.${index}.icon`)}
                        defaultValue={
                          (section.data as any).benefits?.[index]?.icon || ""
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )
              )}
              {(!watch("data.benefits") ||
                (watch("data.benefits") as any[]).length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No benefits added yet. Click "Add Benefit" to get started.
                </p>
              )}
            </div>
          </>
        );
      case "TEAM_LOCATIONS":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("data.title", { required: "Title is required" })}
                defaultValue={(section.data as any).title}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Locations</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentLocations =
                      (watch("data.locations") as any[]) || [];
                    setValue("data.locations", [
                      ...currentLocations,
                      { city: "", country: "", address: "", imageUrl: "" },
                    ]);
                  }}
                >
                  <PiPlus className="mr-1 h-3 w-3" />
                  Add Location
                </Button>
              </div>
              {((watch("data.locations") as any[]) || []).map(
                (_: any, index: number) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Location {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentLocations =
                            (watch("data.locations") as any[]) || [];
                          setValue(
                            "data.locations",
                            currentLocations.filter(
                              (_: any, i: number) => i !== index
                            )
                          );
                        }}
                      >
                        <PiTrash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="City"
                        {...register(`data.locations.${index}.city`)}
                        defaultValue={
                          (section.data as any).locations?.[index]?.city || ""
                        }
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder="Country"
                        {...register(`data.locations.${index}.country`)}
                        defaultValue={
                          (section.data as any).locations?.[index]?.country ||
                          ""
                        }
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder="Address (optional)"
                        {...register(`data.locations.${index}.address`)}
                        defaultValue={
                          (section.data as any).locations?.[index]?.address ||
                          ""
                        }
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder="Image URL (optional)"
                        {...register(`data.locations.${index}.imageUrl`)}
                        defaultValue={
                          (section.data as any).locations?.[index]?.imageUrl ||
                          ""
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )
              )}
              {(!watch("data.locations") ||
                (watch("data.locations") as any[]).length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No locations added yet. Click "Add Location" to get started.
                </p>
              )}
            </div>
          </>
        );
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("data.title", { required: "Title is required" })}
              defaultValue={((section as TypedSection).data as any).title || ""}
              disabled={isSubmitting}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
          <DialogDescription>Update the section details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enabled</Label>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={(checked) => setValue("enabled", checked)}
              disabled={isSubmitting}
            />
          </div>

          {renderSectionFields()}

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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
