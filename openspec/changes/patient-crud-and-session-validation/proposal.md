## Why

Patient management CRUD is incomplete: clinicians can only create patients but cannot edit or delete them, leading to accumulated stale or erroneous patient records. Additionally, the system allows duplicate open sessions per patient, violating the business rule "one open session per patient". These gaps create data quality issues and inconsistent clinical workflows.

## What Changes

1. **Patient Edit Capability** (PATCH `/patients/:id`)
   - Clinician can update patient full name and birth date
   - Returns updated patient object
   
2. **Patient Delete Capability** (DELETE `/patients/:id`)
   - Clinician can delete patient by ID
   - Prevents deletion if patient has sessions in progress
   - Returns 204 No Content on success
   
3. **Session Duplicate Validation** (POST `/sessions`)
   - Backend validates: no open session exists for patient before creating new one
   - Frontend shows validation error before submission
   - Returns 409 Conflict if duplicate open session exists

## Capabilities

### New Capabilities
- `patient-edit-delete`: Edit (full_name, birth_date) and delete patient records with state validation
- `session-duplicate-prevention`: Prevent multiple open sessions per patient via backend validation + frontend UX feedback

### Modified Capabilities
- None (no existing requirement changes, only logical additions to patient/session workflows)

## Impact

- **Backend APIs**: 3 new endpoints (PATCH, DELETE patients; tighter validation on POST sessions)
- **Database**: No schema changes (uses existing patients, sessions tables)
- **Frontend Routes**: `/patients/:id/edit` form component, delete confirmation modal
- **Tests**: New test cases for edit, delete, duplicate session handling
- **CI/CD**: GitHub Actions workflow already validates all changes

## Acceptance Criteria

- ✓ PATCH `/patients/:id` updates and returns patient
- ✓ DELETE `/patients/:id` prevents deletion if sessions in progress
- ✓ POST `/sessions` rejects duplicate open session per patient
- ✓ Frontend forms reflect backend validations
- ✓ All tests passing (backend + frontend)
- ✓ No breaking changes to existing API contracts
