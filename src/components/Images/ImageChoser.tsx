import { useDropzone } from "react-dropzone";
import React, { useState } from "react";
import MediaPicker from './MediaPicker'
import type { AppImageDto } from '@/models/Image'

interface ImageDropZoneProps {
  onDrop?: (files: File[]) => void;
  onSelectImage?: (url: string) => void;
  isLoading?: boolean;
  previewUrl?: string | null;
}

const ImageDropZone: React.FC<ImageDropZoneProps> = ({
  onDrop,
  onSelectImage,
  isLoading = false,
  previewUrl = null,
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const handleDrop = (acceptedFiles: File[]) => {
    console.log("Accepted files:", acceptedFiles);
    if (onDrop) {
      onDrop(acceptedFiles);
    } else {
      console.log("Files dropped:", acceptedFiles);
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
      "image/jpg": [],
    },
    disabled: isLoading,
  });
  return (
    <div className="w-full max-w-xl mx-auto transition border border-gray-200 rounded-xl hover:bg-gray-50 bg-white">
      <form
        {...getRootProps()}
        className={`dropzone rounded-xl border-dashed border-gray-200 p-7 lg:p-10 w-full relative ${
          isDragActive ? 'border-primary-600 bg-gray-50' : 'border-gray-200 bg-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        id="demo-upload"
      >
        {/** If previewUrl provided, show the image inside the drop area **/}
        {/** This keeps the drop/input behavior while displaying the image. */}
        {/** Clicking or dropping will still trigger the dropzone. */}
        {previewUrl ? (
          <div className="w-full h-56 flex items-center justify-center overflow-hidden rounded-md relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-md" />
            <div className="absolute bottom-4 right-4 bg-white/80 rounded px-2 py-1 text-sm text-primary-600 hover:cursor-pointer hover:bg-primary-700 hover:text-white" onClick={() => setShowPicker(true)}>Thay ảnh</div>
          </div>
        ) : (
          <div className="dz-message flex flex-col items-center m-0!">
            {/* Icon Container */}
            <div className="mb-[22px] flex justify-center">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:cursor-pointer">
                <svg
                  className="fill-current"
                  width="29"
                  height="28"
                  viewBox="0 0 29 28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                  />
                </svg>
              </div>
            </div>

            {/* Text Content */}
            <h4 className="mb-3 font-semibold text-gray-800 text-xl">
              {isLoading ? 'Đang xử lý...' : isDragActive ? 'Thả file ảnh vào đây' : 'Kéo thả ảnh vào đây'}
            </h4>

            <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-600">
              {isLoading
                ? 'Vui lòng đợi trong giây lát'
                : 'Kéo thả các file ảnh PNG, JPG, WebP, SVG vào đây hoặc chọn file'}
            </span>

            {!isLoading && (
              <span onClick={() => setShowPicker(true)} className="font-medium underline text-sm text-primary-600 hover:cursor-pointer">Chọn file</span>
            )}
          </div>
        )}
      </form>
      {showPicker && (
        <MediaPicker
          onClose={() => setShowPicker(false)}
          multiSelect={false}
          onSelect={(imgOrImgs: AppImageDto | AppImageDto[]) => {
            // If array provided, take first
            if (Array.isArray(imgOrImgs)) {
              const first = imgOrImgs[0]
              if (!first) return
              if (onSelectImage) onSelectImage(first.url)
              if (onDrop) {
                Promise.all(
                  imgOrImgs.map((it) => fetch(it.url).then((r) => r.blob()))
                )
                  .then((blobs) => blobs.map((b, i) => new File([b], imgOrImgs[i].fileName || `image_${i}`, { type: b.type })))
                  .then((files) => onDrop(files))
                  .catch((e) => console.error(e))
              }
            } else {
              const img = imgOrImgs as AppImageDto
              if (onSelectImage) onSelectImage(img.url)
              if (onDrop) {
                fetch(img.url)
                  .then((res) => res.blob())
                  .then((blob) => {
                    const name = img.fileName || img.url.split('/').pop() || 'image'
                    const file = new File([blob], name, { type: blob.type })
                    onDrop([file])
                  })
                  .catch((e) => console.error(e))
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default ImageDropZone;
