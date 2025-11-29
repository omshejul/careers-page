"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiUpload, PiImage, PiX, PiSpinner } from "react-icons/pi";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  folder = "images",
  disabled = false,
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "url">(
    value ? "url" : "upload"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only images are allowed.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
      toast.success("Image uploaded successfully!");
      setInputMode("url");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      {/* Mode Toggle - Sliding Selector */}
      <div className="relative inline-flex w-full items-center rounded-lg border bg-muted p-1">
        {/* Sliding Background */}
        <div
          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] bg-linear-to-br from-primary to-primary/80 rounded-md shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] transition-transform duration-200 ease-in-out ${
            inputMode === "url" ? "translate-x-[calc(100%+0.5rem)]" : "translate-x-0"
          }`}
        />
        
        {/* Upload Button */}
        <button
          type="button"
          onClick={() => setInputMode("upload")}
          disabled={disabled || isUploading}
          className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            inputMode === "upload"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <PiUpload className="h-4 w-4" />
          Upload
        </button>

        {/* Divider Line */}
        <div className="relative z-10 h-6 w-px bg-border" />

        {/* URL Button */}
        <button
          type="button"
          onClick={() => setInputMode("url")}
          disabled={disabled || isUploading}
          className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            inputMode === "url"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <PiImage className="h-4 w-4" />
          URL
        </button>
      </div>

      {/* Upload Mode */}
      {inputMode === "upload" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
              id={`file-upload-${label}`}
            />
            <label
              htmlFor={`file-upload-${label}`}
              className="flex-1 cursor-pointer"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={disabled || isUploading}
                asChild
              >
                <span>
                  {isUploading ? (
                    <>
                      <PiSpinner className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <PiUpload className="h-4 w-4 mr-2" />
                      Choose Image
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>
      )}

      {/* URL Mode */}
      {inputMode === "url" && (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={value || ""}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={disabled || isUploading}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative mt-2 rounded-lg border overflow-hidden">
          <div className="relative aspect-video w-full bg-muted">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => {
                toast.error("Failed to load image preview");
              }}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="absolute top-2 right-2 bg-background/80 hover:bg-background"
          >
            <PiX className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
