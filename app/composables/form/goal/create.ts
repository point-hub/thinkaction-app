export interface IForm {
  specific: string
  measurable: string
  relevant: string
  achievable: string
  time: Date
  visibility: 'public' | 'private' | 'supporters'
  thumbnail_url: string
  thumbnail_blob: Blob | null | undefined
}

export interface IFormErrors {
  specific: string[]
  measurable: string[]
  relevant: string[]
  achievable: string[]
  time: string[]
  visibility: string[]
  thumbnail_url: string[]
  thumbnail_blob: string[]
}

// Calculate the number of milliseconds in 7 days
const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;

// Add 7 days to the current date's timestamp
const sevenDaysLater = new Date(new Date().getTime() + sevenDaysInMilliseconds);

const defaultForm: IForm = {
  specific: '',
  measurable: '',
  relevant: '',
  achievable: '',
  time: sevenDaysLater,
  visibility: 'public',
  thumbnail_url: '',
  thumbnail_blob: null,
};

const defaultFormErrors: IFormErrors = {
  specific: [],
  measurable: [],
  relevant: [],
  achievable: [],
  time: [],
  visibility: [],
  thumbnail_url: [],
  thumbnail_blob: [],
};

export const useForm = () => useState<IForm>('form', () => {
  return defaultForm;
});

export const useFormErrors = () => useState<IFormErrors>('formErrors', () => {
  return defaultFormErrors;
});

export const useFormGoalCreate = () => {
  const form = useForm();
  const formErrors = useFormErrors();

  const addSmartGoal = (data: IForm) => {
    form.value.specific = data.specific;
    form.value.measurable = data.measurable;
    form.value.achievable = data.achievable;
    form.value.relevant = data.relevant;
    form.value.time = sevenDaysLater;
  };

  const addThumbnail = (thumbnail_blob: Blob) => {
    form.value.thumbnail_blob = thumbnail_blob;
  };

  const addVisibility = (visibility: 'public' | 'private' | 'supporters') => {
    form.value.visibility = visibility;
  };

  const resetForm = () => {
    form.value = defaultForm;
  };

  const resetFormErrors = () => {
    formErrors.value = defaultFormErrors;
  };

  return { form, formErrors, addSmartGoal, addThumbnail, addVisibility, resetForm, resetFormErrors };
};
