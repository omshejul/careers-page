"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PiEye,
  PiGlobe,
  PiPlus,
  PiTrash,
  PiDotsSixVertical,
  PiSparkle,
  PiUsers,
  PiHeart,
  PiVideo,
  PiMapPin,
  PiBriefcase,
  PiFileText,
  PiSpinner,
} from "react-icons/pi";
import { IoCloudDoneOutline } from "react-icons/io5";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
    hasUnpublishedChanges: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
  };
  sections: TypedSection[];
}

// Helper function to get section icon
function getSectionIcon(type: string) {
  switch (type) {
    case "HERO":
      return <PiSparkle className="h-5 w-5" />;
    case "ABOUT":
      return <PiFileText className="h-5 w-5" />;
    case "VALUES":
      return <PiHeart className="h-5 w-5" />;
    case "BENEFITS":
      return <PiUsers className="h-5 w-5" />;
    case "CULTURE_VIDEO":
      return <PiVideo className="h-5 w-5" />;
    case "TEAM_LOCATIONS":
      return <PiMapPin className="h-5 w-5" />;
    case "JOBS_LIST":
      return <PiBriefcase className="h-5 w-5" />;
    default:
      return <PiFileText className="h-5 w-5" />;
  }
}

// Helper function to get section description
function getSectionDescription(section: TypedSection): string {
  const data = section.data as any;
  switch (section.type) {
    case "HERO":
      return data.tagline || "Hero section with title and banner";
    case "ABOUT":
      return data.content
        ? `${data.content.substring(0, 100)}${
            data.content.length > 100 ? "..." : ""
          }`
        : "About section content";
    case "VALUES":
      return data.values?.length
        ? `${data.values.length} value${data.values.length > 1 ? "s" : ""}`
        : "No values added";
    case "BENEFITS":
      return data.benefits?.length
        ? `${data.benefits.length} benefit${
            data.benefits.length > 1 ? "s" : ""
          }`
        : "No benefits added";
    case "CULTURE_VIDEO":
      return data.videoUrl ? "Video embedded" : "No video URL";
    case "TEAM_LOCATIONS":
      return data.locations?.length
        ? `${data.locations.length} location${
            data.locations.length > 1 ? "s" : ""
          }`
        : "No locations added";
    case "JOBS_LIST":
      return data.subtitle || "List of job openings";
    default:
      return "Section content";
  }
}

// Helper function to get section type label
function getSectionTypeLabel(type: string): string {
  switch (type) {
    case "HERO":
      return "Hero";
    case "ABOUT":
      return "About";
    case "VALUES":
      return "Values";
    case "BENEFITS":
      return "Benefits";
    case "CULTURE_VIDEO":
      return "Culture Video";
    case "TEAM_LOCATIONS":
      return "Team Locations";
    case "JOBS_LIST":
      return "Jobs List";
    default:
      return type;
  }
}

// Sortable Section Item Component
function SortableSectionItem({
  section,
  onEdit,
  onDelete,
}: {
  section: TypedSection;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                {...attributes}
                {...listeners}
                className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              >
                <PiDotsSixVertical className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-muted-foreground">
                    {getSectionIcon(section.type)}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {getSectionTypeLabel(section.type)}
                  </Badge>
                  <Badge
                    variant={section.enabled ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {section.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <CardTitle className="text-base mb-1">
                  {(section.data as any).title ||
                    getSectionTypeLabel(section.type)}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {getSectionDescription(section)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={onEdit}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <PiTrash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
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
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [editSection, setEditSection] = useState<TypedSection | null>(null);
  const [seoDialogOpen, setSeoDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<TypedSection | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(
    careersPage.hasUnpublishedChanges
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync sections state when props change (after router.refresh())
  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  useEffect(() => {
    setHasUnpublishedChanges(careersPage.hasUnpublishedChanges);
  }, [careersPage.hasUnpublishedChanges]);

  const handlePublish = async () => {
    setIsPublishing(true);
    setIsSyncing(true);
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
      setHasUnpublishedChanges(false);
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
      setIsSyncing(false);
    }
  };

  const handleDiscardChanges = async () => {
    setIsDiscarding(true);
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/careers/${companyId}/discard`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to discard changes");
      }

      toast.success("Changes discarded successfully");
      setHasUnpublishedChanges(false);
      router.refresh();
    } catch (error) {
      console.error("Error discarding changes:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to discard changes"
      );
    } finally {
      setIsDiscarding(false);
      setIsSyncing(false);
      setDiscardDialogOpen(false);
    }
  };

  const handleConfirmDeleteSection = async () => {
    if (!sectionToDelete) {
      return;
    }
    setIsDeleting(true);
    setIsSyncing(true);
    try {
      const response = await fetch(
        `/api/careers/${companyId}/sections/${sectionToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete section");
      }

      toast.success("Section deleted successfully");
      setSections((current) =>
        current.filter((s) => s.id !== sectionToDelete.id)
      );
      setHasUnpublishedChanges(true);
      router.refresh();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete section"
      );
    } finally {
      setIsDeleting(false);
      setIsSyncing(false);
      setSectionToDelete(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      setIsSyncing(true);

      // Update order in database
      try {
        const updatePromises = newSections.map((section, index) =>
          fetch(`/api/careers/${companyId}/sections/${section.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index }),
          })
        );

        await Promise.all(updatePromises);
        toast.success("Sections reordered successfully");
        setHasUnpublishedChanges(true);
        router.refresh();
      } catch (error) {
        console.error("Error reordering sections:", error);
        toast.error("Failed to reorder sections");
        // Revert on error
        setSections(sections);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSectionAdded = async () => {
    setIsSyncing(true);
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
        setHasUnpublishedChanges(true);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setIsSyncing(false);
    }
    router.refresh();
  };

  const handleSectionUpdated = async () => {
    setIsSyncing(true);
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
        setHasUnpublishedChanges(true);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setIsSyncing(false);
    }
    router.refresh();
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Careers Page Builder</h1>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSyncing || isPublishing ? "syncing" : "synced"}
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  transition={{ duration: 0.2 }}
                  className={`relative p-2 rounded-full transition-colors ${
                    isSyncing || isPublishing ? "bg-muted" : "bg-green-0"
                  }`}
                >
                  {isSyncing || isPublishing ? (
                    <PiSpinner className="h-6 w-6 text-muted-foreground animate-spin" />
                  ) : (
                    <motion.div
                      initial={{ scale: 0, filter: "blur(10px)" }}
                      animate={{ scale: 1, filter: "blur(0px)" }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                    >
                      <IoCloudDoneOutline className="h-6 w-6 text-green-500" />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-muted-foreground">
              Customize your company's careers page
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={`/${companySlug}?preview=true`} target="_blank">
                <PiEye className="mr-1 h-4 w-4" />
                Preview
              </a>
            </Button>
            {careersPage.published && hasUnpublishedChanges && (
              <Button
                variant="destructive"
                onClick={() => setDiscardDialogOpen(true)}
                disabled={isDiscarding || isPublishing}
              >
                {isDiscarding ? "Discarding..." : "Discard Changes"}
              </Button>
            )}
            {(!careersPage.published || hasUnpublishedChanges) && (
              <Button
                onClick={handlePublish}
                disabled={isPublishing || isDiscarding}
              >
                <PiGlobe className="mr-1 h-4 w-4" />
                {isPublishing
                  ? "Publishing..."
                  : careersPage.published
                  ? "Publish Changes"
                  : "Publish"}
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {!careersPage.published ? (
            <Badge variant="secondary">Draft</Badge>
          ) : hasUnpublishedChanges ? (
            <Badge
              variant="outline"
              className="border-amber-500 bg-amber-50 text-amber-700"
            >
              Unpublished Changes
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-600">
              Live
            </Badge>
          )}
        </div>

        {/* Sections List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div>
                <CardTitle>Page Sections</CardTitle>
                <CardDescription>
                  Drag and drop to reorder sections. Click and hold the grip
                  icon to drag.
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sections.map((section) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        onEdit={() => setEditSection(section)}
                        onDelete={() => setSectionToDelete(section)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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

      <ConfirmationDialogs
        discardDialogOpen={discardDialogOpen}
        setDiscardDialogOpen={setDiscardDialogOpen}
        handleDiscardChanges={handleDiscardChanges}
        isDiscarding={isDiscarding}
        sectionToDelete={sectionToDelete}
        setSectionToDelete={setSectionToDelete}
        handleConfirmDeleteSection={handleConfirmDeleteSection}
        isDeleting={isDeleting}
      />
    </>
  );
}

// Alert dialogs
function ConfirmationDialogs({
  discardDialogOpen,
  setDiscardDialogOpen,
  handleDiscardChanges,
  isDiscarding,
  sectionToDelete,
  setSectionToDelete,
  handleConfirmDeleteSection,
  isDeleting,
}: {
  discardDialogOpen: boolean;
  setDiscardDialogOpen: (open: boolean) => void;
  handleDiscardChanges: () => Promise<void>;
  isDiscarding: boolean;
  sectionToDelete: TypedSection | null;
  setSectionToDelete: (section: TypedSection | null) => void;
  handleConfirmDeleteSection: () => Promise<void>;
  isDeleting: boolean;
}) {
  return (
    <>
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unpublished changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert your careers page to the last published version.
              Any draft updates you’ve made since the last publish will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDiscarding}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              disabled={isDiscarding}
            >
              {isDiscarding ? "Discarding..." : "Discard Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={sectionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSectionToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this section?</AlertDialogTitle>
            <AlertDialogDescription>
              You’re about to permanently remove the section "
              {sectionToDelete
                ? (sectionToDelete.data as any)?.title || "Untitled"
                : ""}
              ". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteSection}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Section"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
