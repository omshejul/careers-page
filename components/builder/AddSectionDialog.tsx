"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSectionSchema,
  type CreateSectionInput,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { SectionType } from "@/types/section";
import { PiPlus, PiTrash } from "react-icons/pi";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  currentSectionsCount: number;
  onSectionAdded: () => void;
}

export function AddSectionDialog({
  open,
  onOpenChange,
  companyId,
  currentSectionsCount,
  onSectionAdded,
}: AddSectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionType, setSectionType] = useState<SectionType | "">("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateSectionInput & { enabled: boolean }>({
    resolver: zodResolver(createSectionSchema) as any,
    defaultValues: {
      type: "HERO",
      order: currentSectionsCount,
      enabled: true,
      data: {},
    },
  });

  const onSubmit = async (data: CreateSectionInput) => {
    if (!sectionType) {
      toast.error("Please select a section type");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data based on section type
      const sectionData: any = {
        type: sectionType,
        order: currentSectionsCount,
        enabled: true,
        data: {},
      };

      // Set default data based on type
      switch (sectionType) {
        case "HERO":
          sectionData.data = {
            title: data.data.title || "Welcome to Our Team",
            tagline: data.data.tagline || "",
            bannerUrl: data.data.bannerUrl || "",
          };
          break;
        case "ABOUT":
          sectionData.data = {
            title: data.data.title || "About Us",
            content: data.data.content || "",
          };
          break;
        case "JOBS_LIST":
          sectionData.data = {
            title: data.data.title || "Open Positions",
            subtitle: data.data.subtitle || "",
          };
          break;
        case "VALUES":
          sectionData.data = {
            title: data.data.title || "Our Values",
            values: Array.isArray(data.data.values)
              ? data.data.values.filter((v: any) => v.title && v.description)
              : [],
          };
          break;
        case "BENEFITS":
          sectionData.data = {
            title: data.data.title || "Benefits",
            benefits: Array.isArray(data.data.benefits)
              ? data.data.benefits.filter((b: any) => b.title && b.description)
              : [],
          };
          break;
        case "CULTURE_VIDEO":
          sectionData.data = {
            title: data.data.title || "Our Culture",
            videoUrl: data.data.videoUrl || "",
            description: data.data.description || "",
          };
          break;
        case "TEAM_LOCATIONS":
          sectionData.data = {
            title: data.data.title || "Our Locations",
            locations: Array.isArray(data.data.locations)
              ? (data.data.locations as any[]).filter(
                  (l: any) => l.city && l.country
                )
              : [],
          };
          break;
      }

      const response = await fetch(`/api/careers/${companyId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create section");
      }

      toast.success("Section added successfully!");
      reset();
      setSectionType("");
      onOpenChange(false);
      onSectionAdded();
    } catch (error) {
      console.error("Error creating section:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create section"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Add a new section to your careers page
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Section Type *</Label>
            <Select
              value={sectionType}
              onValueChange={(value) => setSectionType(value as SectionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HERO">Hero</SelectItem>
                <SelectItem value="ABOUT">About</SelectItem>
                <SelectItem value="VALUES">Values</SelectItem>
                <SelectItem value="BENEFITS">Benefits</SelectItem>
                <SelectItem value="CULTURE_VIDEO">Culture Video</SelectItem>
                <SelectItem value="TEAM_LOCATIONS">Team Locations</SelectItem>
                <SelectItem value="JOBS_LIST">Jobs List</SelectItem>
              </SelectContent>
            </Select>
            {!sectionType && (
              <p className="text-sm text-destructive">
                Please select a section type
              </p>
            )}
          </div>

          {sectionType && (
            <div className="space-y-4">
              {/* Title - required for all sections */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("data.title", { required: "Title is required" })}
                  placeholder="Section title"
                  disabled={isSubmitting}
                />
                {errors.data && (errors.data as any).title && (
                  <p className="text-sm text-destructive">
                    {(errors.data as any).title.message}
                  </p>
                )}
              </div>

              {/* HERO Section Fields */}
              {sectionType === "HERO" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      {...register("data.tagline")}
                      placeholder="Hero tagline"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bannerUrl">Banner Image URL</Label>
                    <Input
                      id="bannerUrl"
                      {...register("data.bannerUrl")}
                      placeholder="https://example.com/image.jpg"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* ABOUT Section Fields */}
              {sectionType === "ABOUT" && (
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    {...register("data.content", {
                      required: "Content is required",
                    })}
                    placeholder="About section content"
                    rows={6}
                    disabled={isSubmitting}
                  />
                  {errors.data && (errors.data as any).content && (
                    <p className="text-sm text-destructive">
                      {(errors.data as any).content.message}
                    </p>
                  )}
                </div>
              )}

              {/* JOBS_LIST Section Fields */}
              {sectionType === "JOBS_LIST" && (
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    {...register("data.subtitle")}
                    placeholder="Jobs list subtitle"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* CULTURE_VIDEO Section Fields */}
              {sectionType === "CULTURE_VIDEO" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL *</Label>
                    <Input
                      id="videoUrl"
                      {...register("data.videoUrl", {
                        required: "Video URL is required",
                      })}
                      placeholder="https://youtube.com/watch?v=..."
                      disabled={isSubmitting}
                    />
                    {errors.data && (errors.data as any).videoUrl && (
                      <p className="text-sm text-destructive">
                        {(errors.data as any).videoUrl.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("data.description")}
                      placeholder="Video description"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

              {/* VALUES Section Fields */}
              {sectionType === "VALUES" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Values</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentValues =
                          (watch("data.values") as any[]) || [];
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
                      <div
                        key={index}
                        className="rounded-lg border p-4 space-y-3"
                      >
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
                            disabled={isSubmitting}
                          />
                          <Textarea
                            placeholder="Value description"
                            rows={2}
                            {...register(`data.values.${index}.description`)}
                            disabled={isSubmitting}
                          />
                          <Input
                            placeholder="Icon URL (optional)"
                            {...register(`data.values.${index}.icon`)}
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
              )}

              {/* BENEFITS Section Fields */}
              {sectionType === "BENEFITS" && (
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
                      <div
                        key={index}
                        className="rounded-lg border p-4 space-y-3"
                      >
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
                            disabled={isSubmitting}
                          />
                          <Textarea
                            placeholder="Benefit description"
                            rows={2}
                            {...register(`data.benefits.${index}.description`)}
                            disabled={isSubmitting}
                          />
                          <Input
                            placeholder="Icon URL (optional)"
                            {...register(`data.benefits.${index}.icon`)}
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
              )}

              {/* TEAM_LOCATIONS Section Fields */}
              {sectionType === "TEAM_LOCATIONS" && (
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
                      <div
                        key={index}
                        className="rounded-lg border p-4 space-y-3"
                      >
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
                            disabled={isSubmitting}
                          />
                          <Input
                            placeholder="Country"
                            {...register(`data.locations.${index}.country`)}
                            disabled={isSubmitting}
                          />
                          <Input
                            placeholder="Address (optional)"
                            {...register(`data.locations.${index}.address`)}
                            disabled={isSubmitting}
                          />
                          <Input
                            placeholder="Image URL (optional)"
                            {...register(`data.locations.${index}.imageUrl`)}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )
                  )}
                  {(!watch("data.locations") ||
                    (watch("data.locations") as any[]).length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No locations added yet. Click "Add Location" to get
                      started.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
                setSectionType("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !sectionType}>
              {isSubmitting ? "Adding..." : "Add Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
