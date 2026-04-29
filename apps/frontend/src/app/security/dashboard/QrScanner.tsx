"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { CheckCircle, Loader2, Camera, CameraOff } from "lucide-react";
import clsx from "clsx";

type ScanState = "scanning" | "processing" | "success" | "error";

interface LastScanned {
  code: string;
  studentName: string;
  studentId: string;
  time: string;
}

// Debounce: ignore the same QR code for this many ms after a successful scan
const RESCAN_COOLDOWN_MS = 5000;

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScannedCode = useRef<string | null>(null);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<LastScanned | null>(null);
  // Controls the green overlay flash
  const [flashSuccess, setFlashSuccess] = useState(false);

  const handleDetected = useCallback((code: string) => {
    // Ignore duplicates during cooldown
    if (lastScannedCode.current === code) return;
    lastScannedCode.current = code;

    setScanState("processing");

    // Simulate API call — 2 s processing animation
    setTimeout(() => {
      setScanState("success");
      setFlashSuccess(true);
      setLastScanned({
        code,
        studentName: "Dizzpy Sanchez",   // will come from API later
        studentId: "29854",
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      });

      // Hide success overlay after 2 s, then resume scanning
      setTimeout(() => {
        setScanState("scanning");
        setFlashSuccess(false);

        // Start cooldown — same code won't re-trigger until it expires
        cooldownTimer.current = setTimeout(() => {
          lastScannedCode.current = null;
        }, RESCAN_COOLDOWN_MS);
      }, 2000);
    }, 2000);
  }, []);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    codeReader
      .decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
        if (result) {
          handleDetected(result.getText());
        }
        if (err && !(err instanceof NotFoundException)) {
          // NotFoundException fires on every empty frame — ignore it
          console.error("QR scan error:", err);
        }
      })
      .catch((err: Error) => {
        if (err.name === "NotAllowedError") {
          setCameraError("Camera permission denied. Please allow camera access and reload.");
        } else if (err.name === "NotFoundError") {
          setCameraError("No camera found on this device.");
        } else {
          setCameraError("Could not start camera: " + err.message);
        }
      });

    return () => {
      codeReader.reset();
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    };
  }, [handleDetected]);

  if (cameraError) {
    return (
      <div className="w-full max-w-[720px] mx-auto">
        <div className="bg-[#0f172a] rounded-[32px] flex flex-col items-center justify-center gap-4 p-12 border border-gray-800 shadow-xl min-h-[420px]">
          <CameraOff className="w-12 h-12 text-red-400" strokeWidth={1.5} />
          <p className="text-white/70 text-[14px] font-medium text-center max-w-[320px]">{cameraError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-5">
      {/* Scanner card */}
      <div className="relative bg-[#0f172a] rounded-[32px] overflow-hidden border border-gray-800 shadow-xl aspect-[4/3] max-h-[480px]">
        {/* Live webcam feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          muted
          playsInline
        />

        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

        {/* Success flash overlay */}
        <div
          className={clsx(
            "absolute inset-0 bg-green-500/20 pointer-events-none transition-opacity duration-300",
            flashSuccess ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Corner guides */}
        {scanState !== "success" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[220px] h-[220px]">
              {/* Animated border color: blue while scanning, yellow while processing */}
              {(["tl","tr","bl","br"] as const).map((corner) => (
                <div
                  key={corner}
                  className={clsx(
                    "absolute w-10 h-10 transition-colors duration-300",
                    corner === "tl" && "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg",
                    corner === "tr" && "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg",
                    corner === "bl" && "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg",
                    corner === "br" && "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg",
                    scanState === "processing" ? "border-yellow-400" : "border-white"
                  )}
                />
              ))}

              {/* Scan line (only while scanning) */}
              {scanState === "scanning" && (
                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-400/90 blur-[1px] shadow-[0_0_8px_2px_#60a5fa] animate-[scanline_2s_ease-in-out_infinite]" />
              )}

              {/* Processing spinner (center of frame) */}
              {scanState === "processing" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" strokeWidth={2} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success overlay — green tick + name */}
        {scanState === "success" && lastScanned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_32px_8px_rgba(34,197,94,0.4)] animate-[popIn_0.3s_ease-out]">
              <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
            <p className="text-white text-[20px] font-bold mt-1">Attendance Marked</p>
            <p className="text-white/70 text-[13px] font-medium">{lastScanned.studentName} · {lastScanned.studentId}</p>
            <p className="text-white/50 text-[12px]">{lastScanned.time}</p>
          </div>
        )}

        {/* Status pill — bottom center */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
          {scanState === "scanning" && (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white/80 text-[12px] font-medium">Position QR code in the frame</span>
            </div>
          )}
          {scanState === "processing" && (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-yellow-400/20">
              <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
              <span className="text-yellow-300 text-[12px] font-medium">Marking attendance…</span>
            </div>
          )}
          {scanState === "success" && (
            <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-300 text-[12px] font-medium">Marked successfully</span>
            </div>
          )}
        </div>
      </div>

      {/* Last scanned record */}
      {lastScanned && (
        <div className="bg-white border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm animate-[fadeUp_0.3s_ease-out]">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#0f172a]">{lastScanned.studentName}</p>
            <p className="text-[12px] text-[#64748b]">ID {lastScanned.studentId} · Checked in at {lastScanned.time}</p>
          </div>
          <span className="text-[11px] font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
            QR
          </span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0%   { top: 0;    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.4); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}
