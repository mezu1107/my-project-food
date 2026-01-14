// src/features/riders/admin/components/RiderDocumentsViewer.tsx
// RESPONSIVE PRODUCTION VERSION — JANUARY 14, 2026
// Mobile/tablet/desktop friendly: grid adapts, full-screen image preview

import { useState } from "react";
import { FileImage, FileText, ZoomIn } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { RiderDocuments } from "../../types/adminRider.types";

interface RiderDocumentsViewerProps {
  documents: RiderDocuments;
  riderName?: string;
  className?: string;
}

export function RiderDocumentsViewer({
  documents,
  riderName = "Rider",
  className,
}: RiderDocumentsViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const hasAnyDocument =
    documents.cnicFront ||
    documents.cnicBack ||
    documents.drivingLicense ||
    documents.riderPhoto;

  if (!hasAnyDocument) {
    return (
      <div className={clsx("py-6 text-center text-muted-foreground", className)}>
        <p className="text-sm sm:text-base italic">
          No documents uploaded yet
        </p>
      </div>
    );
  }

  const documentItems = [
    { key: "cnicFront" as const, label: "CNIC Front", icon: FileImage, url: documents.cnicFront },
    { key: "cnicBack" as const, label: "CNIC Back", icon: FileImage, url: documents.cnicBack },
    { key: "drivingLicense" as const, label: "Driving License", icon: FileText, url: documents.drivingLicense },
    { key: "riderPhoto" as const, label: "Rider Photo", icon: FileImage, url: documents.riderPhoto },
  ].filter((item) => !!item.url);

  return (
    <div className={clsx("space-y-6", className)}>
      {/* Grid of document previews */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
        {documentItems.map((doc) => (
          <Dialog key={doc.key}>
            <DialogTrigger asChild>
              <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group border-border">
                <CardContent className="p-2 sm:p-3 text-center space-y-2">
                  <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
                    <img
                      src={doc.url}
                      alt={doc.label}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/fallback-document.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <doc.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <span className="text-xs sm:text-sm font-medium truncate">
                      {doc.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>

            {/* Full-screen preview dialog */}
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 sm:max-w-4xl">
              <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b">
                <DialogTitle className="text-lg sm:text-xl truncate">
                  {doc.label} — {riderName}
                </DialogTitle>
              </DialogHeader>
              <div className="p-2 sm:p-6 overflow-auto max-h-[80vh]">
                <img
                  src={doc.url}
                  alt={doc.label}
                  className="max-h-[70vh] w-full object-contain mx-auto rounded-lg shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback-document-large.png";
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Summary badges - wrap on small screens */}
      {(documents.vehicleType || documents.vehicleNumber || documents.cnicNumber) && (
        <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
          {documents.vehicleType && (
            <Badge variant="outline" className="text-xs sm:text-sm px-2.5 py-1">
              Vehicle: {documents.vehicleType}
            </Badge>
          )}
          {documents.vehicleNumber && (
            <Badge variant="outline" className="text-xs sm:text-sm px-2.5 py-1 font-mono">
              Reg: {documents.vehicleNumber}
            </Badge>
          )}
          {documents.cnicNumber && (
            <Badge variant="outline" className="text-xs sm:text-sm px-2.5 py-1 font-mono">
              CNIC: {documents.cnicNumber}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}