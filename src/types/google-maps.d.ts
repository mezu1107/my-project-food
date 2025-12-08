// src/types/google-maps.d.ts
// src/types/google-maps.d.ts
interface Window {
  google?: {
    maps?: {
      places?: {
        Autocomplete: any;
      };
    };
  };
}

declare const google: any;

