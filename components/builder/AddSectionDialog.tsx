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
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { SectionType } from "@/types/section";
import { PiPlus, PiTrash, PiSparkle, PiSpinner } from "react-icons/pi";
import { faker } from "@faker-js/faker";
import { motion } from "framer-motion";

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
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Generate random data for the selected section type
  const generateRandomData = async () => {
    if (!sectionType) {
      toast.error("Please select a section type first");
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      switch (sectionType) {
        case "HERO":
          setValue(
            "data.title",
            faker.helpers.arrayElement([
              "Join Our Team",
              "Build the Future with Us",
              "Your Career Starts Here",
              "We're Hiring",
              "Come Work with Us",
            ])
          );
          setValue(
            "data.tagline",
            faker.helpers.arrayElement([
              "We're looking for talented individuals to help us shape the future",
              "Join a team that's passionate about innovation and excellence",
              "Be part of something bigger. Make an impact.",
              "Work with the best. Build amazing things.",
              "Your next adventure starts here",
            ])
          );
          setValue(
            "data.bannerUrl",
            faker.image.url({ width: 1920, height: 1080 })
          );
          break;

        case "ABOUT":
          setValue(
            "data.title",
            faker.helpers.arrayElement([
              "About Us",
              "Who We Are",
              "Our Story",
              "About Our Company",
              "Get to Know Us",
            ])
          );
          setValue("data.content", faker.lorem.paragraphs(4, "\n\n"));
          break;

        case "JOBS_LIST":
          setValue(
            "data.title",
            faker.helpers.arrayElement([
              "Open Positions",
              "Join Our Team",
              "Current Openings",
              "We're Hiring",
              "Career Opportunities",
            ])
          );
          setValue(
            "data.subtitle",
            faker.helpers.arrayElement([
              "Explore exciting opportunities to grow your career",
              "Find your next role with us",
              "Discover positions that match your skills",
              "We're always looking for great talent",
              "Check out our latest job openings",
            ])
          );
          break;

        case "VALUES":
          setValue(
            "data.title",
            faker.helpers.arrayElement([
              "Our Values",
              "What We Stand For",
              "Our Core Values",
              "Company Values",
              "What Matters to Us",
            ])
          );
          const values = [
            { title: "Innovation", description: faker.lorem.sentence() },
            { title: "Integrity", description: faker.lorem.sentence() },
            { title: "Excellence", description: faker.lorem.sentence() },
            { title: "Collaboration", description: faker.lorem.sentence() },
            { title: "Growth", description: faker.lorem.sentence() },
          ];
          setValue("data.values", values);
          break;

        case "BENEFITS":
          setValue(
            "data.title",
            faker.helpers.arrayElement([
              "Benefits & Perks",
              "Why Work With Us",
              "Employee Benefits",
              "What We Offer",
              "Benefits Package",
            ])
          );
          const benefits = [
            { title: "Health Insurance", description: faker.lorem.sentence() },
            {
              title: "Flexible Work Hours",
              description: faker.lorem.sentence(),
            },
            {
              title: "Remote Work Options",
              description: faker.lorem.sentence(),
            },
            {
              title: "Professional Development",
              description: faker.lorem.sentence(),
            },
            {
              title: "Competitive Salary",
              description: faker.lorem.sentence(),
            },
            { title: "Paid Time Off", description: faker.lorem.sentence() },
          ];
          setValue("data.benefits", benefits);
          break;

        case "CULTURE_VIDEO":
          setValue(
            "data.title",
            faker.helpers.arrayElement([
              "Our Culture",
              "Life at Our Company",
              "Company Culture",
              "See Us in Action",
              "Our Team Culture",
            ])
          );
          setValue(
            "data.videoUrl",
            faker.helpers.arrayElement([
              "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              "https://vimeo.com/123456789",
              "https://www.youtube.com/watch?v=jNQXAC9IVRw",
            ])
          );
          setValue("data.description", faker.lorem.paragraph());
          break;

        case "TEAM_LOCATIONS":
          setValue(
            "data.title",
            faker.helpers.arrayElement([
              "Our Locations",
              "Where We Work",
              "Global Offices",
              "Our Offices",
              "Find Us",
            ])
          );
          const locations = Array.from(
            { length: faker.number.int({ min: 2, max: 4 }) },
            () => ({
              city: faker.location.city(),
              country: faker.location.country(),
              address: faker.location.streetAddress(),
              imageUrl: faker.image.url({ width: 800, height: 600 }),
            })
          );
          setValue("data.locations", locations);
          break;
      }

      toast.success("Random data generated!");
    } catch (error) {
      console.error("Error generating data:", error);
      toast.error("Failed to generate data");
    } finally {
      setIsGenerating(false);
    }
  };

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
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[600px]">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Add a new section to your careers page
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="type">Section Type *</Label>
                <Select
                  value={sectionType}
                  onValueChange={(value) =>
                    setSectionType(value as SectionType)
                  }
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
                    <SelectItem value="TEAM_LOCATIONS">
                      Team Locations
                    </SelectItem>
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isGenerating ? { rotate: [0, 10, -10, 10, -10, 0] } : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateRandomData}
                    disabled={isGenerating || isSubmitting}
                    className="gap-2 mt-6"
                  >
                    {isGenerating ? (
                      <>
                        <PiSpinner className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <PiSparkle className="h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            {sectionType && (
              <div className="space-y-4">
                {/* Title - required for all sections */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register("data.title", {
                      required: "Title is required",
                    })}
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
                    <ImageUpload
                      label="Banner Image"
                      value={(watch("data.bannerUrl") as string) || undefined}
                      onChange={(url) => setValue("data.bannerUrl" as any, url)}
                      folder="banners"
                      disabled={isSubmitting}
                    />
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
                          className="rounded-lg border p-4 space-y-2 mb-3"
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
                            <ImageUpload
                              label="Icon (optional)"
                              value={
                                (watch(
                                  `data.values.${index}.icon`
                                ) as unknown as string | undefined) || undefined
                              }
                              onChange={(url) =>
                                setValue(
                                  `data.values.${index}.icon` as any,
                                  url
                                )
                              }
                              folder="icons"
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
                              {...register(
                                `data.benefits.${index}.description`
                              )}
                              disabled={isSubmitting}
                            />
                            <ImageUpload
                              label="Icon (optional)"
                              value={
                                (watch(
                                  `data.benefits.${index}.icon`
                                ) as unknown as string | undefined) || undefined
                              }
                              onChange={(url) =>
                                setValue(
                                  `data.benefits.${index}.icon` as any,
                                  url
                                )
                              }
                              folder="icons"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      )
                    )}
                    {(!watch("data.benefits") ||
                      (watch("data.benefits") as any[]).length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No benefits added yet. Click "Add Benefit" to get
                        started.
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
                            {
                              city: "",
                              country: "",
                              address: "",
                              imageUrl: "",
                            },
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
                          className="rounded-lg border p-4 space-y-2 mb-3"
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
                            <ImageUpload
                              label="Image (optional)"
                              value={
                                (watch(
                                  `data.locations.${index}.imageUrl`
                                ) as unknown as string | undefined) || undefined
                              }
                              onChange={(url) =>
                                setValue(
                                  `data.locations.${index}.imageUrl` as any,
                                  url
                                )
                              }
                              folder="locations"
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
          </div>

          <DialogFooter className="shrink-0 border-t mt-4 pt-2">
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
