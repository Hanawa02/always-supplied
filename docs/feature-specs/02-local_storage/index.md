# Feature: Local storage

## Story

As a user I want to have my supplied building and supply configuration saved and accessible even if I refresh the page.

## Scope

- data should be saved locally, in a storage db (indexedDB)
  - consider using dexie
- we may want to store it on cloud in the future, so make sure the functionality is scalable
- define and use an architecture/pattern for storing data so we can reuse it when we add more functionalities
