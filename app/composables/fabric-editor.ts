import { ref, shallowRef, watch, onUnmounted, nextTick } from 'vue';
import * as fabric from 'fabric';

// We make the state refs exportable to be used in any component
// These will be updated by the canvas events
export const editorState = {
  textColor: ref('#111111'),
  bgColor: ref<string | null>(null),
  textSize: ref(20),
  selectedFont: ref('Inter, sans-serif'),
  textAlign: ref<'left' | 'center' | 'right'>('center'),
  isBold: ref(false),
  outerColor: ref<string | fabric.TFiller | null>(null),
  outerThickness: ref(1),
};

export function useFabricEditor(
  canvasEl: Ref<HTMLCanvasElement | null>,
  containerEl: Ref<HTMLDivElement | null>,
  backgroundImageSrc: Ref<string>,
) {
  // Use shallowRef for non-reactive, complex objects like the canvas
  const canvas = shallowRef<fabric.Canvas | null>(null);

  const updateToolbarState = () => {
    const activeObj = canvas.value?.getActiveObject();
    if (activeObj instanceof fabric.IText) {
      editorState.isBold.value = activeObj.fontWeight === 'bold';
      editorState.outerColor.value = activeObj.stroke || null;
      editorState.outerThickness.value = activeObj.strokeWidth || 1;
      editorState.textColor.value = (activeObj.fill as string) || '#111111';
      editorState.bgColor.value = activeObj.textBackgroundColor || null;
      editorState.textSize.value = activeObj.fontSize || 20;
      editorState.selectedFont.value = activeObj.fontFamily || 'Inter, sans-serif';
      editorState.textAlign.value =
        (activeObj.textAlign as 'left' | 'center' | 'right') || 'center';
    } else {
      clearToolbarState();
    }
  };

  const clearToolbarState = () => {
    editorState.isBold.value = false;
    editorState.outerColor.value = null;
    editorState.outerThickness.value = 1;
  };

  // --- Canvas Initialization and Background ---
  const initCanvas = async () => {
    await nextTick();
    if (!canvasEl.value || !containerEl.value) return;

    if (canvas.value) canvas.value.dispose();

    const containerWidth = containerEl.value.clientWidth;
    const size = Math.min(containerWidth, 540);

    const newCanvas = new fabric.Canvas(canvasEl.value, {
      width: size,
      height: size,
      backgroundColor: '#fafafa',
      preserveObjectStacking: true,
      selection: false,
    });

    newCanvas.on('object:added', (e) => {
      const obj = e.target;
      if (obj && (obj.type === 'textbox' || obj.type === 'i-text')) {
        obj.set({ lockRotation: true, hasControls: false });
      }
    });

    newCanvas.on('selection:created', updateToolbarState);
    newCanvas.on('selection:updated', updateToolbarState);
    newCanvas.on('selection:cleared', clearToolbarState);

    canvas.value = newCanvas;
    setCanvasBackground(backgroundImageSrc.value);

    // Auto-resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!canvas.value || !containerEl.value) return;
      const width = containerEl.value.clientWidth;
      const height = containerEl.value.clientHeight;
      const scale = width / canvas.value.width!;
      canvas.value.setDimensions({ width, height });
      canvas.value.setZoom(scale);
      canvas.value.requestRenderAll();
    });
    resizeObserver.observe(containerEl.value);

    // Clean up observer on unmount
    onUnmounted(() => resizeObserver.disconnect());
  };

  const setCanvasBackground = (url: string) => {
    if (!canvas.value) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const fabricImg = new fabric.Image(img, {
        originX: 'center',
        originY: 'center',
        left: canvas.value!.width! / 2,
        top: canvas.value!.height! / 2,
      });
      const scale = Math.min(
        canvas.value!.width! / fabricImg.width!,
        canvas.value!.height! / fabricImg.height!,
      );
      fabricImg.scale(scale);
      canvas.value!.backgroundImage = fabricImg;
      canvas.value!.renderAll();
    };
    img.src = url;
  };

  // --- Exposed Methods ---
  const addText = () => {
    if (!canvas.value) return;

    const activeObj = canvas.value.getActiveObject() as fabric.IText | undefined;
    if (activeObj && activeObj.type === 'i-text') {
      activeObj.enterEditing();
      canvas.value.requestRenderAll();
      return;
    }

    const textObj = new fabric.IText('', {
      left: canvas.value.width! / 2,
      top: canvas.value.height! / 2,
      originX: 'center',
      originY: 'center',
      fill: editorState.textColor.value,
      fontSize: editorState.textSize.value,
      fontFamily: editorState.selectedFont.value,
      textBackgroundColor: editorState.bgColor.value || '',
      textAlign: editorState.textAlign.value,
      fontWeight: editorState.isBold.value ? 'bold' : 'normal',
      stroke: editorState.outerColor.value || undefined,
      strokeWidth: editorState.outerColor.value ? editorState.outerThickness.value : 0,
      editable: true,
      lockRotation: true,
      hasControls: false,
      hasBorders: false,
      splitByGrapheme: false,
      width: 200,
    });

    canvas.value.add(textObj);
    canvas.value.setActiveObject(textObj);
    textObj.enterEditing();
    updateToolbarState();
  };

  const getActiveTextObject = (): fabric.IText | null => {
    const activeObj = canvas.value?.getActiveObject();
    return activeObj instanceof fabric.IText ? activeObj : null;
  };

  const changeFont = (font: string) => {
    editorState.selectedFont.value = font;
    const activeObj = getActiveTextObject();
    if (activeObj) {
      activeObj.set('fontFamily', font);
      canvas.value?.requestRenderAll();
    }
  };

  const changeColor = (color: string) => {
    editorState.textColor.value = color;
    const activeObj = getActiveTextObject();
    if (activeObj) {
      if (activeObj.isEditing && activeObj.selectionStart !== activeObj.selectionEnd) {
        activeObj.setSelectionStyles({ fill: color });
      } else {
        activeObj.set({ fill: color });
      }
      canvas.value?.requestRenderAll();
    }
  };

  const changeBgColor = (color: string) => {
    editorState.bgColor.value = editorState.bgColor.value === color ? null : color;
    const activeObj = getActiveTextObject();
    if (activeObj) {
      activeObj.set('textBackgroundColor', editorState.bgColor.value || '');
      canvas.value?.requestRenderAll();
    }
  };

  const changeTextAlign = (align: 'left' | 'center' | 'right') => {
    editorState.textAlign.value = align;
    const activeObj = getActiveTextObject();
    if (activeObj) {
      activeObj.set('textAlign', align);
      canvas.value?.requestRenderAll();
    }
  };

  const toggleBold = () => {
    editorState.isBold.value = !editorState.isBold.value;
    const activeObj = getActiveTextObject();
    if (activeObj) {
      activeObj.set('fontWeight', editorState.isBold.value ? 'bold' : 'normal');
      canvas.value?.requestRenderAll();
    }
  };

  const changeOuterColor = (color: string | null) => {
    editorState.outerColor.value = editorState.outerColor.value === color ? null : color;
    const activeObj = getActiveTextObject();
    if (activeObj) {
      activeObj.set({
        stroke: editorState.outerColor.value || undefined,
        strokeWidth: editorState.outerColor.value ? editorState.outerThickness.value : 0,
      });
      canvas.value?.requestRenderAll();
    }
  };

  const deleteSelectedText = () => {
    const activeObj = getActiveTextObject();
    if (activeObj) {
      canvas.value?.remove(activeObj);
      canvas.value?.discardActiveObject();
      canvas.value?.requestRenderAll();
      clearToolbarState();
    }
  };

  // --- Watch for state changes from the toolbar ---

  watch(editorState.textSize, (newSize) => {
    const activeObj = getActiveTextObject();
    if (activeObj) {
      activeObj.set('fontSize', newSize);
      canvas.value?.requestRenderAll();
    }
  });

  // --- Exporting ---

  const getFinalImageBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!canvas.value) return resolve(null);
      // Deselect all objects for a clean export
      canvas.value.discardActiveObject();
      canvas.value.requestRenderAll();
      canvas.value.getElement().toBlob((blob) => {
        resolve(blob);
      }, 'image/webp', 1.0);
    });
  };

  const downloadImage = async () => {
    const blob = await getFinalImageBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'goal_image.webp';
      a.click();
      URL.revokeObjectURL(url);
      alert('✅ Image download initiated!');
    } else {
      alert('❌ Error: Could not save image.');
    }
  };

  // --- Lifecycle ---

  onMounted(initCanvas);

  onUnmounted(() => {
    canvas.value?.dispose();
  });

  // Expose public API
  return {
    // Methods
    addText,
    changeFont,
    changeColor,
    changeBgColor,
    changeTextAlign,
    toggleBold,
    changeOuterColor,
    deleteSelectedText,
    downloadImage,
    getFinalImageBlob,
    // Reactive State (already exported, but good to return for injection)
    ...editorState,
  };
}
