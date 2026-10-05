// ─────────────────────────────────────────────────────────────────────────────
// The `@ui/lib/toast` subpath entry — `toast()` and `<Toaster>` without the
// package barrel.
//
// Toast is the one part of the library called imperatively from anywhere (a
// data hook, a mutation handler), so it is the part most often imported from
// code that has no other reason to touch the barrel. Teams that lint the barrel
// out need a path in; this is it.
//
// It shares the toast store with the main entry: Rollup emits the store as one
// chunk both entries import, so `toast()` from here reaches a `<Toaster>`
// imported from `@ui/lib`, and the reverse.
//
// Styles are NOT carried by this entry, exactly like the main one — the library
// ships one stylesheet, `@ui/lib/styles.css`, imported once by the app.
// ─────────────────────────────────────────────────────────────────────────────
export { Toaster, toast } from './components/Toast';
export type {
  ToastVariant,
  ToastPosition,
  ToastOptions,
  ToastAction,
  ToastCancel,
  ToasterProps,
  ToastPromiseMessages,
} from './components/Toast';
