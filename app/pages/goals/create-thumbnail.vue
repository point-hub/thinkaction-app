<script setup lang="ts">
import { ref, onMounted, nextTick, defineAsyncComponent, watch } from 'vue';
import * as fabric from 'fabric';
import 'vue-advanced-cropper/dist/style.css';
import { useFormGoalCreate } from '~/composables/form/goal/create';

const { form, formErrors } = useFormGoalCreate();
const { user: myUser } = useAuth();

const Cropper = defineAsyncComponent(() =>
  import('vue-advanced-cropper').then((m) => m.Cropper),
);

const fileInput = ref<HTMLInputElement | null>(null);
const uploadedImage = ref<string | null>(null);
const croppedImage = ref<string | null>(null);
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);
const textColor = ref('#111111');
const bgColor = ref<string | null>(null);
const textSize = ref(20);
const selectedFont = ref('Inter, sans-serif');
const textAlign = ref<'left' | 'center' | 'right'>('center');
const isBold = ref(false);

let canvas: fabric.Canvas | null = null;

const activePanel = ref<string | null>(null);
const showPanel = (panel: string) => {
  activePanel.value = panel;
};

const showCropGuide = ref(true);
const hideCropGuide = () => {
  showCropGuide.value = false;
};

const fonts = [
  'Inter, sans-serif',
  'Arial, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Times New Roman, serif',
  '"Comic Sans MS", cursive, sans-serif',
];

const colors = [
  '#111111', '#ffffff', '#e91e63', '#ff9800',
  '#4caf50', '#2196f3', '#9c27b0', '#f44336', '#ffeb3b',
];

// Responsive init
const initCanvas = async () => {
  await nextTick();
  if (canvasEl.value && canvasContainer.value) {
    if (canvas) canvas.dispose();

    const containerWidth = canvasContainer.value.clientWidth;
    const size = Math.min(containerWidth, 540);

    canvas = new fabric.Canvas(canvasEl.value, {
      width: size,
      height: size,
      backgroundColor: '#fafafa',
      preserveObjectStacking: true,
      selection: false,
    });

    canvas.on('object:added', (e) => {
      const obj = e.target;
      if (obj && obj.type === 'textbox' || obj.type === 'i-text') { // Also apply to i-text
        obj.set({
          lockRotation: true,
          hasControls: false,
        });
      }
    });

    // Listen for object selection to update bold state
    canvas.on('selection:created', updateToolbarState);
    canvas.on('selection:updated', updateToolbarState);
    canvas.on('selection:cleared', clearToolbarState);
  }
};

const updateToolbarState = () => {
  const activeObj = canvas?.getActiveObject();
  if (activeObj instanceof fabric.IText) {
    isBold.value = activeObj.fontWeight === 'bold';
    textColor.value = activeObj.fill as string || '#111111';
    bgColor.value = activeObj.textBackgroundColor || null;
    textSize.value = activeObj.fontSize || 20;
    selectedFont.value = activeObj.fontFamily || 'Inter, sans-serif';
    textAlign.value = activeObj.textAlign as 'left' | 'center' | 'right' || 'center';
  } else {
    clearToolbarState();
  }
};

const clearToolbarState = () => {
  isBold.value = false;
};

onMounted(() => {
  initCanvas();
});

// Handle upload
const handleFileChange = (file: File | null) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImage.value = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};
const onFileSelect = (e: Event) => handleFileChange((e.target as HTMLInputElement).files?.[0] || null);
const onDrop = (e: DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  handleFileChange(file || null);
};
const onDragOver = (e: DragEvent) => e.preventDefault();

const isCropped = ref(false);
const applyCrop = async () => {
  if (!cropperRef.value) return;
  const result = cropperRef.value.getResult();
  if (!result || !result.coordinates || !result.image) return;

  const { coordinates } = result;
  const sourceImage = new Image();
  sourceImage.crossOrigin = 'anonymous';
  sourceImage.src = uploadedImage.value!;

  sourceImage.onload = async () => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = coordinates.width;
    offCanvas.height = coordinates.height;

    const ctx = offCanvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      sourceImage,
      coordinates.left,
      coordinates.top,
      coordinates.width,
      coordinates.height,
      0,
      0,
      coordinates.width,
      coordinates.height,
    );

    croppedImage.value = offCanvas.toDataURL('image/webp');

    await nextTick();

    await initCanvas();

    if (!croppedImage.value || !canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const fabricImg = new fabric.FabricImage(img, {
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
      });

      const scale = Math.min(
        canvas!.width! / fabricImg.width!,
        canvas!.height! / fabricImg.height!,
      );
      fabricImg.scale(scale);

      canvas!.width = fabricImg.width! * scale;
      canvas!.height = fabricImg.height! * scale;
      canvas!.backgroundImage = fabricImg;
      canvas!.renderAll();
      canvas!.requestRenderAll();

      canvasContainer.value!.style.width = `${canvas!.width}px`;
      canvasContainer.value!.style.height = `${canvas!.height}px`;
      isCropped.value = true;
    };
    img.src = croppedImage.value;
  };
};

const addText = () => {
  if (!canvas) return;

  const activeObj = canvas.getActiveObject() as fabric.IText | undefined;
  if (activeObj && activeObj.type === 'i-text') { // Ensure it's an i-text for direct editing
    activeObj.enterEditing();
    canvas.requestRenderAll();
    return;
  }

  const initialText = ' ';

  const textObj = new fabric.IText(initialText, {
    left: canvas.width! / 2,
    top: canvas.height! / 2,
    originX: 'center',
    originY: 'center',
    fill: textColor.value,
    fontSize: textSize.value,
    fontFamily: selectedFont.value,
    textBackgroundColor: bgColor.value || '',
    textAlign: textAlign.value,
    editable: true,
    lockRotation: true,
    hasControls: false,
    hasBorders: false,
    splitByGrapheme: false,
    width: 200,
    backgroundColor: '#ffffff',
    fontWeight: isBold.value ? 'bold' : 'normal',
  });

  canvas.add(textObj);
  canvas.setActiveObject(textObj);
  canvas.requestRenderAll();

  textObj.enterEditing();

  updateToolbarState(); // Update toolbar state for the newly added text
};

// Change font family
const changeFont = (font: string) => {
  selectedFont.value = font;
  const activeObj = canvas?.getActiveObject();
  if (activeObj instanceof fabric.IText) {
    activeObj.set('fontFamily', font);
    canvas?.requestRenderAll();
  }
};

// Change text color
const changeColor = (color: string) => {
  textColor.value = color;

  const activeObj = canvas?.getActiveObject();
  if (!activeObj) return;

  if (activeObj instanceof fabric.IText) {
    if (activeObj.isEditing && activeObj.selectionStart !== activeObj.selectionEnd) {
      activeObj.setSelectionStyles({ fill: color });
    } else {
      activeObj.set({ fill: color });
    }
  }
  canvas?.requestRenderAll();
};

// Change background color
const changeBgColor = (color: string) => {
  bgColor.value = bgColor.value === color ? null : color;
  const activeObj = canvas?.getActiveObject();
  if (activeObj instanceof fabric.IText) {
    activeObj.set('textBackgroundColor', bgColor.value || '');
    canvas?.requestRenderAll();
  }
};

// Change alignment
const changeTextAlign = (align: 'left' | 'center' | 'right') => {
  textAlign.value = align;
  const activeObj = canvas?.getActiveObject();
  if (activeObj instanceof fabric.IText) {
    activeObj.set('textAlign', align);
    canvas?.requestRenderAll();
  }
};

// Toggle Bold
const toggleBold = () => {
  isBold.value = !isBold.value;
  const activeObj = canvas?.getActiveObject();
  if (activeObj instanceof fabric.IText) {
    activeObj.set('fontWeight', isBold.value ? 'bold' : 'normal');
    canvas?.requestRenderAll();
  }
};

// Delete selected text
const deleteSelectedText = () => {
  const activeObj = canvas?.getActiveObject();
  if (activeObj instanceof fabric.IText) {
    canvas?.remove(activeObj);
    canvas?.discardActiveObject();
    canvas?.requestRenderAll();
    clearToolbarState(); // Clear state after deleting
  }
};

// Watch font size
watch(textSize, (newSize) => {
  const activeObj = canvas?.getActiveObject();
  if (activeObj instanceof fabric.IText) {
    activeObj.set('fontSize', newSize);
    canvas?.requestRenderAll();
  }
});

// Export final image (resized to 1080px width)
const toBlob = async () => {
  if (!canvas) return;

  // Desired export width
  const targetWidth = 1080;
  const scale = targetWidth / canvas.width!;

  // Save current zoom and size
  const originalWidth = canvas.width!;
  const originalHeight = canvas.height!;
  const originalZoom = canvas.getZoom();

  // Scale up
  canvas.setZoom(scale);
  canvas.setDimensions({
    width: originalWidth * scale,
    height: originalHeight * scale,
  });
  canvas.renderAll();

  let blob = await canvas.toBlob({
    format: 'webp',
    quality: 0.9,
    multiplier: 1,
  });

  // If the size > 500kb, we assume that formatting to webp is failed
  // then try to optimize the image using jpeg instead
  if (blob && blob.size / 1024 > 500) {
    blob = await canvas.toBlob({
      format: 'jpeg',
      quality: 0.9,
      multiplier: 1,
    });
  }

  // TODO: Handle error for big file
  // if (blob!.size / 1024 > 2.000) {
  //   toast('Image size is too big.', { color: 'danger' });
  // }

  // Restore original scale
  canvas.setZoom(originalZoom);
  canvas.setDimensions({
    width: originalWidth,
    height: originalHeight,
  });
  canvas.renderAll();

  return blob;
};

const onBack = () => {
  navigateTo('/goals/create');
};

const onNext = async () => {
  if (!isCropped.value) {
    toast('Please upload your photo before continue.', { color: 'danger' });
    return;
  }
  form.value.thumbnail_blob = await toBlob();
  navigateTo('/goals/create-visibility');
};
</script>

<template>
  <layouts-with-aside aside-title="">
    <div class="max-w-lg mx-auto lg:p-8">
      <div class="p-4 bg-white flex flex-col gap-4 border border-gray-200 shadow-lg lg:rounded-xl">
        <div class="flex items-center gap-2">
          <my-avatar />
          <div>
            <p class="font-semibold">{{ myUser?.username }}</p>
            <p class="text-gray-500 text-xs">{{ myUser?.profile?.status }}</p>
          </div>
        </div>

        <div v-if="!uploadedImage && !croppedImage">
          <input id="fileInput" ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelect">
          <div
            class="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-10 text-center cursor-pointer hover:bg-gray-50 transition"
            @drop="onDrop"
            @dragover="onDragOver"
            @click="fileInput?.click()"
          >
            <p class="text-gray-500 mb-2">Drag & Drop your image here</p>
            <p class="text-gray-400 text-sm mb-3">or click to upload</p>
          </div>
        </div>

        <div v-else-if="uploadedImage && !croppedImage">
          <div class="relative">
            <Suspense>
              <template #default>
                <div class="w-full aspect-square relative">
                  <!-- Cropper Component -->
                  <cropper
                    ref="cropperRef"
                    :src="uploadedImage"
                    :resize-image="{
                      adjustStencil: true,
                    }"
                    :stencil-props="{
                      movable: true,
                      resizable: true,
                    }"
                    default-boundaries="fill"
                    image-restriction="fit-area"
                    style="width: 100%; height: 100%;background: white !important"
                    @mousedown="hideCropGuide"
                    @touchstart.passive="hideCropGuide"
                  />

                  <!-- GUIDE OVERLAY -->
                  <transition name="fade">
                    <div
                      v-if="showCropGuide"
                      class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white text-center p-6"
                    >
                      <div class="i-fluent:hand-drag-20-regular text-4xl mb-3 animate-bounce" />
                      <p class="text-sm font-medium">Drag the image to adjust your crop area</p>
                      <p class="text-xs text-gray-200 mt-1">(You can move it to center your subject)</p>
                      <button
                        class="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-1 rounded-lg text-sm"
                        @click="hideCropGuide"
                      >
                        Got it
                      </button>
                    </div>
                  </transition>
                </div>
              </template>

              <template #fallback>
                <div class="text-gray-400 text-center">Loading cropper...</div>
              </template>
            </Suspense>

            <button
              class="w-full bg-[#393939] hover:bg-[#595959] text-white font-medium py-3"
              @click="applyCrop"
            >
              Use This Image
            </button>
          </div>
        </div>

        <div v-else-if="croppedImage">
          <div
            ref="canvasContainer"
            class="w-full w-full mx-auto overflow-hidden"
          >
            <canvas ref="canvasEl" />
          </div>

          <div
            class="w-full w-full mx-auto bg-[#2c2c2c]/95 text-white p-2 flex items-center justify-between gap-2"
          >
            <template v-if="!activePanel">
              <div class="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hidden">

                <button
                  class="px-3 py-2 rounded-lg transition"
                  title="Add Text"
                  @click="addText"
                >
                  <div class="i-icon-park-outline:text text-xl" />
                </button>

                <button
                  class="px-3 py-2 rounded-lg transition"
                  :class="{ 'bg-white/20': isBold, 'hover:bg-white/10': !isBold }"
                  title="Toggle Bold"
                  @click="toggleBold"
                >
                  <div class="i-material-symbols:format-bold text-xl" />
                </button>

                <button
                  class="px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  @click="showPanel('font')"
                >
                  <div class="i-iconoir:f-square text-xl" />
                </button>

                <button
                  class="px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  @click="showPanel('color')"
                >
                  <div class="i-fluent:color-20-regular text-xl" />
                </button>

                <button
                  class="px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  @click="showPanel('background')"
                >
                  <div class="i-iconoir:fill-color text-xl" />
                </button>

                <button
                  class="px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  @click="showPanel('size')"
                >
                  <div class="i-proicons:text-font-size text-xl" />
                </button>

                <button
                  class="p-2 rounded-lg hover:bg-white/10 transition"
                  title="Change Alignment"
                  @click="changeTextAlign(
                    textAlign === 'left' ? 'center' :
                    textAlign === 'center' ? 'right' :
                    'left'
                  )"
                >
                  <span v-if="textAlign === 'left'">
                    <div class="i-flowbite:align-left-outline text-xl" />
                  </span>
                  <span v-else-if="textAlign === 'center'">
                    <div class="i-flowbite:align-center-outline text-xl" />
                  </span>
                  <span v-else>
                    <div class="i-flowbite:align-right-outline text-xl" />
                  </span>
                </button>
              </div>

              <button
                class="px-3 py-2 rounded-lg hover:bg-red-700 transition"
                title="Delete Selected Text"
                @click="deleteSelectedText"
              >
                <div class="i-mdi:trash-can-outline text-xl" />
              </button>
            </template>

            <template v-else>
              <div class="flex-1 flex items-center justify-start gap-2 overflow-x-auto scrollbar-hidden">

                <template v-if="activePanel === 'font'">
                  <div class="flex items-center gap-1">
                    <label class="text-sm text-gray-300 mx-2">Font</label>
                    <button
                      v-for="font in fonts"
                      :key="font"
                      :value="font"
                      :class="{ 'bg-white/20': selectedFont === font }"
                      class="px-2 py-1 rounded-md text-sm hover:bg-white/10 transition whitespace-nowrap border border-gray-600"
                      :style="{ fontFamily: font }"
                      @click="changeFont(font)"
                    >
                      {{ font.split(',')[0]?.replace(/"/g, '') }}
                    </button>
                  </div>
                </template>

                <template v-if="activePanel === 'color'">
                  <div class="flex items-center gap-1">
                    <label class="text-sm text-gray-300 mx-2">Color</label>
                    <button
                      v-for="color in colors"
                      :key="color"
                      class="w-6 h-6 rounded-full border"
                      :style="{ backgroundColor: color, borderColor: textColor === color ? '#fff' : '#555' }"
                      @click="changeColor(color)"
                    />
                  </div>
                </template>

                <template v-if="activePanel === 'background'">
                  <div class="flex items-center gap-1">
                    <label class="text-sm text-gray-300 mx-2">Background</label>
                    <button
                      v-for="color in colors"
                      :key="color"
                      class="w-6 h-6 rounded-full border"
                      :style="{ backgroundColor: color, borderColor: bgColor === color ? '#fff' : '#555' }"
                      @click="changeBgColor(color)"
                    />
                  </div>
                </template>

                <template v-if="activePanel === 'size'">
                  <label class="text-sm text-gray-300 mx-2">Size</label>
                  <input
                    v-model="textSize"
                    type="range"
                    min="10"
                    max="72"
                    step="1"
                    class="w-32"
                  >
                  <span class="text-xs w-8 text-right">{{ textSize }}</span>
                </template>

              </div>

              <button
                class="p-2 rounded-lg hover:bg-white/10"
                title="Close"
                @click="activePanel = null"
              >
                ✕
              </button>
            </template>
          </div>
        </div>
        <div class="flex items-center justify-between w-full">
          <div>
            <base-button size="lg" shape="rounded" variant="filled" color="danger" @click="onBack">
              <div class="i-icon-park-solid:left-two" /> Back
            </base-button>
          </div>
          <div>
            <base-button v-if="isCropped" size="lg" shape="rounded" variant="filled" color="primary" @click="onNext">
              Next <div class="i-icon-park-solid:right-two" />
            </base-button>
          </div>
        </div>
      </div>
    </div>

    <template #aside>
      <aside-content>
        <div class="flex-1 w-full text-sm space-y-4 overflow-y-auto">
          <div class="flex justify-start space-x-1 w-90%">
            <div>
              <base-avatar name="AI" src="/images/ai.webp" :size="48" />
            </div>
            <div class="bg-slate-100 text-slate-600 rounded-lg p-3">
              <p>
                Upload your image that represents your goal. You can add text, change colors, and customize it to make it truly yours!
              </p>
            </div>
          </div>
          <div v-if="uploadedImage" class="flex justify-start space-x-1 w-90%">
            <div>
              <base-avatar name="AI" src="/images/ai.webp" :size="48" />
            </div>
            <div class="bg-slate-100 text-slate-600 rounded-lg p-3">
              <p>
                Crop your image to focus on the most important part. You can adjust the cropping area as needed.
              </p>
            </div>
          </div>
          <div v-if="croppedImage" class="flex justify-start space-x-1">
            <div>
              <base-avatar name="AI" src="/images/ai.webp" :size="48" />
            </div>
            <div class="bg-slate-100 text-slate-600 rounded-lg p-3">
              <p>
                Add text to your image to highlight your goal. Use the toolbar to customize font, color, size, and more!
              </p>
            </div>
          </div>
        </div>
      </aside-content>
    </template>
  </layouts-with-aside>
</template>
