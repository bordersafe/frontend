"use client";

import { FormEvent, useRef, useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";

type UploadSignatureResponse = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  allowedFormats: string;
  publicId: string;
  uploadUrl: string;
};

interface DisputeResponseFormProps {
  escrowId: string;
  isOpen: boolean;
  onSuccess?: () => void;
}

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function DisputeResponseForm({
  escrowId,
  isOpen,
  onSuccess,
}: DisputeResponseFormProps) {
  const { post } = useAuthedApi();
  const [message, setMessage] = useState("");
  const [evidence, setEvidence] = useState<
    Array<{ name: string; url: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.currentTarget.files;
    if (!files) return;

    for (const file of files) {
      // Validate file
      if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
        setError(
          `Invalid file type: ${file.type}. Allowed: JPG, PNG, WebP, PDF`
        );
        continue;
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        setError(`File too large: ${file.name} (max 6MB)`);
        continue;
      }

      // Get upload signature
      setIsUploading(true);
      try {
        const signatureData = await post<UploadSignatureResponse>(
          "/api/uploads/signature",
          {
            purpose: "dispute_evidence",
            escrow_id: escrowId,
          }
        );

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", String(signatureData.timestamp));
        formData.append("signature", signatureData.signature);
        formData.append("folder", signatureData.folder);
        formData.append("public_id", signatureData.publicId);

        const uploadResponse = await fetch(signatureData.uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const uploadedData = await uploadResponse.json();
        setEvidence((prev) => [
          ...prev,
          {
            name: file.name,
            url: uploadedData.secure_url,
          },
        ]);
        setError(null);
      } catch (err) {
        setError(
          `Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setIsUploading(false);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a response message");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await post(`/api/escrow/${escrowId}/dispute/response`, {
        message: message.trim(),
        evidence: evidence.map((e) => e.url),
      });

      setSuccess(true);
      setMessage("");
      setEvidence([]);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit response"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rounded-lg border border-(--border) bg-white p-6">
      <h3 className="heading-3 mb-4">Respond to Dispute</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Your Response
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide your response to the dispute..."
            className="mt-2 w-full rounded border border-(--border) bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--action)"
            rows={5}
            disabled={isSubmitting || isUploading}
          />
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="evidence" className="block text-sm font-medium">
            Upload Evidence (Optional)
          </label>
          <p className="mt-1 text-xs text-(--ink-muted)">
            JPG, PNG, WebP, PDF up to 6MB each
          </p>
          <input
            ref={fileInputRef}
            id="evidence"
            type="file"
            multiple
            accept={ALLOWED_UPLOAD_TYPES.join(",")}
            onChange={handleFileSelect}
            className="mt-2"
            disabled={isSubmitting || isUploading}
          />
        </div>

        {/* Evidence List */}
        {evidence.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              Uploaded Evidence ({evidence.length})
            </p>
            <div className="space-y-2">
              {evidence.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded bg-blue-50 px-3 py-2"
                >
                  <span className="text-sm text-blue-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(idx)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded bg-green-50 p-3 text-sm text-green-700">
            Response submitted successfully!
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isUploading || !message.trim()}
            className="rounded bg-(--action) px-4 py-2 text-sm font-medium text-(--action-ink) hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </button>
          <p className="text-xs text-(--ink-muted) self-center">
            {isUploading && "Uploading file..."}
          </p>
        </div>
      </form>
    </div>
  );
}
