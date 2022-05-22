import { Observable } from 'rxjs';

export abstract class LanguageService {
  /**
   * Gets the translated value of a key (or an array of keys)
   * @param key
   * @param interpolateParams
   * @returns {any} the translated key, or an object of translated keys
   */
  abstract get(
    key: string | Array<string>,
    interpolateParams?: Object
  ): Observable<string | any>;
  /**
   * Returns a translation instantly from the internal state of loaded translation.
   * All rules regarding the current language, the preferred language of even fallback languages will be used except any promise handling.
   * @param key
   * @param interpolateParams
   * @returns {string}
   */
  abstract instant(key: string | Array<string>, interpolateParams?: Object): string | any;
}
