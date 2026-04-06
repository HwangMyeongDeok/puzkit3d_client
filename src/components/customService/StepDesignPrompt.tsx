import { Upload, Sparkles, CheckCircle2, Lightbulb, Trash2, FileText } from 'lucide-react';
import type { ConfiguratorState } from './types';
import { cn } from '@/lib/utils'; // Bác nhớ import cn nếu chưa có, dùng để handle classname

interface StepDesignPromptProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
  onGenerate: () => void;
}

const MAX_IMAGE_COUNT = 4; // Giới hạn tối đa 4 ảnh

export default function StepDesignPrompt({
  config,
  updateConfig,
  onGenerate,
}: StepDesignPromptProps) {
  const currentFiles = config.uploadedFiles || [];

  // Logic đếm số lượng hình ảnh thực sự đã chọn
  const imageFiles = currentFiles.filter((file) => file.type.startsWith('image/'));
  const otherFiles = currentFiles.filter((file) => !file.type.startsWith('image/'));
  const isMaxImagesReached = imageFiles.length >= MAX_IMAGE_COUNT;

  // Hàm xử lý khi khách chọn/kéo thả file
  const handleFilesAdded = (newFiles: File[]) => {
    const acceptedImages = newFiles
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, MAX_IMAGE_COUNT - imageFiles.length); // Chặn chỉ lấy đủ 4 tấm

    const otherAcceptedFiles = newFiles.filter((file) => !file.type.startsWith('image/'));

    updateConfig({ uploadedFiles: [...currentFiles, ...acceptedImages, ...otherAcceptedFiles] });
  };

  // Hàm xoá file lỡ chọn nhầm
  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = currentFiles.filter((_, idx) => idx !== indexToRemove);
    updateConfig({ uploadedFiles: updatedFiles });
  };

  return (
    <div className="animate-in fade-in mx-auto max-w-5xl space-y-8 duration-500">
      <div className="mb-8 space-y-3">
        <h2 className="text-3xl font-extrabold text-blue-950 md:text-4xl">
          {config.Type === 'Sketch' ? 'Upload Schematics & References' : 'Generative Design Prompt'}
        </h2>
        <p className="text-lg text-slate-600">
          Provide detailed context or upload images for the best possible result.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Input Area */}
        <div className="space-y-5 lg:col-span-2">
          {config.Type === 'Sketch' ? (
            <div className="space-y-6">
              {/* O Placeholder "Drag & Drop" (Chỉ hiện khi chưa chọn đủ 4 ảnh) */}
              {!isMaxImagesReached && (
                <div
                  className="group cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center transition-colors hover:border-blue-950 hover:bg-blue-50"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-950', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-950', 'bg-blue-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-950', 'bg-blue-50');
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      handleFilesAdded(files);
                    }
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept=".step,.stp,.iges,.igs,.stl,.pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFilesAdded(Array.from(e.target.files));
                        e.target.value = ''; // Reset input để có thể chọn lại file cùng tên
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex cursor-pointer flex-col items-center gap-4"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-colors group-hover:border-blue-200 group-hover:bg-blue-100">
                      <Upload size={30} className="text-slate-400 group-hover:text-blue-950" />
                    </div>
                    <div>
                      <p className="mb-1 text-lg font-bold text-blue-950">Drag & Drop Files Here</p>
                      <p className="text-sm font-medium text-slate-500">
                        Supported: .STEP, .STL, Images (Max 4)
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Grid Hiển Thị Thumbnail Xem Trước */}
              {imageFiles.length > 0 && (
                <div className="animate-in fade-in space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-700">✓ Selected Design Assets</h4>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold',
                        isMaxImagesReached
                          ? 'bg-green-100 text-green-600'
                          : 'bg-green-100 text-yellow-700'
                      )}
                    >
                      {imageFiles.length} / {MAX_IMAGE_COUNT} Images Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {imageFiles.map((file, idx) => {
                      // Tạo URL tạm thời để preview
                      const imageUrl = URL.createObjectURL(file);
                      return (
                        <div
                          key={idx}
                          className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-slate-100 bg-white p-2 shadow-sm"
                        >
                          <img
                            src={imageUrl}
                            alt={`Preview ${file.name}`}
                            className="h-2/3 w-full rounded-md object-contain"
                            onLoad={() => URL.revokeObjectURL(imageUrl)} // Giải phóng bộ nhớ
                          />
                          <div className="mt-2 w-full overflow-hidden px-1 text-center">
                            <p
                              className="truncate text-xs font-medium text-slate-700"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>

                          {/* Nút xoá trên từng ảnh */}
                          <button
                            onClick={() => {
                              // Cần tìm đúng index trong mảng config.uploadedFiles tổng
                              const originalIdx = currentFiles.indexOf(file);
                              handleRemoveFile(originalIdx);
                            }}
                            className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                            title="Remove file"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hiển thị PDF/STEP dưới dạng list text (nếu có) */}
              {otherFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-semibold text-slate-600">Other Files:</h5>
                  <ul className="space-y-1.5">
                    {otherFiles.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-md border border-slate-100 bg-white p-2 text-sm text-slate-700 shadow-sm"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText size={16} className="shrink-0 text-slate-400" />
                          <span className="truncate font-medium">{file.name}</span>
                        </div>
                        <button
                          onClick={() => {
                            const originalIdx = currentFiles.indexOf(file);
                            handleRemoveFile(originalIdx);
                          }}
                          className="ml-2 text-slate-400 transition-colors hover:text-red-500"
                          title="Remove file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <textarea
                value={config.aiPrompt}
                onChange={(e) => updateConfig({ aiPrompt: e.target.value })}
                placeholder="E.g., Design a drone landing gear structure. The part must fit within a 15x15x10cm bounding box..."
                className="h-64 w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-5 py-5 text-lg leading-relaxed font-medium text-slate-700 shadow-inner transition-all placeholder:text-slate-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
              />
              <button
                onClick={onGenerate}
                disabled={!config.aiPrompt.trim() || config.isGenerating}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-950 px-6 py-4 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {config.isGenerating ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Processing Blueprint...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> Generate AI Architecture
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Pro Guidelines Panel (Giữ nguyên) */}
        <div className="h-fit rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-blue-950">
            <Lightbulb size={24} className="text-red-500" />
            <h3 className="text-lg font-bold">Pro Guidelines</h3>
          </div>
          {config.Type === 'Sketch' ? (
            <ul className="space-y-4 text-sm text-slate-700">
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />{' '}
                <span>Ensure models are watertight. Max 4 images.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />{' '}
                <span>Export in mm (millimeters) for scaling accuracy.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />{' '}
                <span>Include mechanical drawings if strict tolerances are needed.</span>
              </li>
            </ul>
          ) : (
            <ul className="space-y-4 text-sm text-slate-700">
              <li>
                <strong className="mb-1 block text-blue-950">1. Purpose</strong> What is this part
                doing?
              </li>
              <li>
                <strong className="mb-1 block text-blue-950">2. Dimensions Constraints</strong>{' '}
                Mention max width/height limits if any.
              </li>
              <li>
                <strong className="mb-1 block text-blue-950">3. Stress</strong> Describe what forces
                act upon it.
              </li>
              <li>
                <strong className="mb-1 block text-blue-950">4. Interfaces</strong> How does it
                attach to other parts?
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-12 flex justify-between border-t border-slate-200 pt-8">
        <button
          onClick={() => updateConfig({ step: 2 })}
          className="flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-blue-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => updateConfig({ step: 4 })}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          Next: Target Logistics
        </button>
      </div>
    </div>
  );
}
