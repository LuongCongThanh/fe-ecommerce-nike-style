/**
 * The storefront's `ApiError` is the SDK's `ApiError` — one module, one shape. It used to be a second
 * class with the same fields plus the `isUnauthorized`/`isValidation`/… predicates, joined to the SDK's
 * by a translation shim that existed only to convert one into the other; the predicates now live on
 * the SDK class, so there is nothing left to translate.
 */
export { ApiError } from '@repo/api-sdk/client/error';
