import { BottleFormState } from "../types/bottle";


export type AddBottleStackParamList = {
  Capture: undefined;
  BottleForm: {
    imageUri: string | null;
    initialForm: BottleFormState;
  };
};
