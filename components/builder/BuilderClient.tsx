"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PiEye, PiFloppyDisk, PiGlobe, PiPlus, PiTrash } from "react-icons/pi";
import { toast } from "sonner";
import { AddSectionDialog } from "./AddSectionDialog";
import { EditSectionDialog } from "./EditSectionDialog";
import { SEOSettingsDialog } from "./SEOSettingsDialog";
import type { TypedSection } from "@/types/section";

interface BuilderClientProps {
  companyId: string;
  companySlug: string;
  careersPage: {
    id: string;
    published: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
  };
  sections: TypedSection[];
}

export function BuilderClient({
  companyId,
  companySlug,
  careersPage,
  sections: initialSections,
}: BuilderClientProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [isPublishing, setIsPublishing] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [editSection, setEditSection] = useState<TypedSection | null>(null);
  const [seoDialogOpen, setSeoDialogOpen] = useState(false);

  // Sync sections state when props change (after router.refresh())
  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/careers/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to publish");
      }

      toast.success("Careers page published successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to publish careers page"
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/careers/${companyId}/sections/${sectionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete section");
      }

      toast.success("Section deleted successfully");
      setSections(sections.filter((s) => s.id !== sectionId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete section"
      );
    }
  };

  const handleSectionAdded = async () => {
    // Fetch updated sections from the API
    try {
      const response = await fetch(`/api/careers/${companyId}`);
      if (response.ok) {
        const result = await response.json();
        const updatedSections = result.data?.sections || [];
        // Serialize sections to match the expected format
        const serializedSections = updatedSections.map((s: any) => ({
          id: s.id || s._id?.toString(),
          type: s.type,
          order: s.order,
          enabled: s.enabled,
          data: s.data,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        }));
        setSections(serializedSections);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
    router.refresh();
  };

  const handleSectionUpdated = async () => {
    // Fetch updated sections from the API
    try {
      const response = await fetch(`/api/careers/${companyId}`);
      if (response.ok) {
        const result = await response.json();
        const updatedSections = result.data?.sections || [];
        // Serialize sections to match the expected format
        const serializedSections = updatedSections.map((s: any) => ({
          id: s.id || s._id?.toString(),
          type: s.type,
          order: s.order,
          enabled: s.enabled,
          data: s.data,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        }));
        setSections(serializedSections);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
    router.refresh();
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Careers Page Builder</h1>
            <p className="text-muted-foreground">
              Customize your company's careers page
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={`/${companySlug}`} target="_blank">
                <PiEye className="mr-1 h-4 w-4" />
                Preview
              </a>
            </Button>
            {!careersPage.published && (
              <Button onClick={handlePublish} disabled={isPublishing}>
                <PiGlobe className="mr-1 h-4 w-4" />
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={careersPage.published ? "default" : "secondary"}>
            {careersPage.published ? "Published" : "Draft"}
          </Badge>
        </div>

        {/* Sections List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Page Sections</CardTitle>
                <CardDescription>
                  Manage the sections on your careers page
                </CardDescription>
              </div>
              <Button onClick={() => setAddSectionOpen(true)}>
                <PiPlus className="mr-1 h-4 w-4" />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sections.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No sections added yet</p>
                <p className="text-sm">Click "Add Section" to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section) => (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{section.type}</Badge>
                          <CardTitle className="text-base">
                            {(section.data as any).title || section.type}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={section.enabled ? "default" : "secondary"}
                          >
                            {section.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditSection(section)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSection(section.id)}
                          >
                            <PiTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>
              Optimize your careers page for search engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">SEO Title</label>
              <p className="text-sm text-muted-foreground">
                {careersPage.seoTitle || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">SEO Description</label>
              <p className="text-sm text-muted-foreground">
                {careersPage.seoDescription || "Not set"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSeoDialogOpen(true)}
            >
              Edit SEO Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddSectionDialog
        open={addSectionOpen}
        onOpenChange={setAddSectionOpen}
        companyId={companyId}
        currentSectionsCount={sections.length}
        onSectionAdded={handleSectionAdded}
      />

      {editSection && (
        <EditSectionDialog
          open={!!editSection}
          onOpenChange={(open) => !open && setEditSection(null)}
          companyId={companyId}
          section={editSection}
          onSectionUpdated={handleSectionUpdated}
        />
      )}

      <SEOSettingsDialog
        open={seoDialogOpen}
        onOpenChange={setSeoDialogOpen}
        companyId={companyId}
        initialData={{
          seoTitle: careersPage.seoTitle || "",
          seoDescription: careersPage.seoDescription || "",
        }}
        onUpdated={() => {
          router.refresh();
        }}
      />
    </>
  );
}
