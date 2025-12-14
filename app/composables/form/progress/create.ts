export interface IForm {
  goal_id: string
  caption: string
  media_url: string
  media_blob: Blob | null | undefined
  thumbnail_url: string
  thumbnail_blob: Blob | null | undefined
}

export interface IFormErrors {
  goal_id: string[]
  caption: string[]
  media_url: string[]
  media_blob: string[]
  thumbnail_url: string[]
  thumbnail_blob: string[]
}

const defaultForm: IForm = {
  goal_id: '',
  caption: '',
  media_url: '',
  media_blob: null,
  thumbnail_url: '',
  thumbnail_blob: null,
};

const defaultFormErrors: IFormErrors = {
  goal_id: [],
  caption: [],
  media_url: [],
  media_blob: [],
  thumbnail_url: [],
  thumbnail_blob: [],
};

export const useForm = () => useState<IForm>('form', () => {
  return defaultForm;
});

export const useFormErrors = () => useState<IFormErrors>('formErrors', () => {
  return defaultFormErrors;
});

export const useFormProgressCreate = () => {
  const form = useForm();
  const formErrors = useFormErrors();

  const addThumbnail = (thumbnail_blob: Blob) => {
    form.value.thumbnail_blob = thumbnail_blob;
  };

  const addCaption = (caption: string) => {
    form.value.caption = caption;
  };

  const resetForm = () => {
    form.value = defaultForm;
  };

  const resetFormErrors = () => {
    formErrors.value = defaultFormErrors;
  };

  return { form, formErrors, addThumbnail, addCaption, resetForm, resetFormErrors };
};
