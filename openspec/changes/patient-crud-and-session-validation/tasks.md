## 1. Backend - Patient Edit Endpoint

- [ ] 1.1 Implement PATCH `/patients/:id` route handler in backend/src/modules/patients/index.ts
- [ ] 1.2 Add PatientsRepository.update(id, fullName, birthDate) method
- [ ] 1.3 Add input validation (non-empty fullName, valid ISO date format)
- [ ] 1.4 Return updated patient object in response
- [ ] 1.5 Handle 404 for non-existent patient ID

## 2. Backend - Patient Delete Endpoint

- [ ] 2.1 Implement DELETE `/patients/:id` route handler in backend/src/modules/patients/index.ts
- [ ] 2.2 Add PatientsRepository.delete(id) method with transaction
- [ ] 2.3 Add SessionsRepository.countOpenByPatientId(patientId) check before delete
- [ ] 2.4 Return 409 Conflict if open sessions exist for patient
- [ ] 2.5 Return 204 No Content on successful delete
- [ ] 2.6 Handle 404 for non-existent patient ID

## 3. Backend - Session Duplicate Validation

- [ ] 3.1 Add SessionsRepository.findOpenByPatientId(patientId) query method
- [ ] 3.2 Add validation in POST `/sessions` handler before creating new session
- [ ] 3.3 Return 409 Conflict with message if open session exists
- [ ] 3.4 Ensure validation happens transactionally (READ_COMMITTED isolation)
- [ ] 3.5 Update API endpoint response contract documentation if needed

## 4. Frontend - Patient Edit Form Component

- [ ] 4.1 Create/update patient edit component at frontend/src/app/features/patients/components/edit.component.ts
- [ ] 4.2 Load patient data via GET `/patients/:id` on component init
- [ ] 4.3 Add form fields for full name and birth date with validators
- [ ] 4.4 Implement PATCH request to `/patients/:id` on form submit
- [ ] 4.5 Show success/error messages
- [ ] 4.6 Navigate back to patient list after successful edit

## 5. Frontend - Patient Delete UI

- [ ] 5.1 Add delete button/icon to patient list component (list.component.ts)
- [ ] 5.2 Show confirmation modal before delete
- [ ] 5.3 Implement DELETE request to `/patients/:id` on confirmation
- [ ] 5.4 Handle 409 error: show message "Cannot delete - patient has active sessions"
- [ ] 5.5 Remove patient from list after successful delete
- [ ] 5.6 Show loading state during request

## 6. Frontend - Session Duplicate Prevention

- [ ] 6.1 Add pre-submit check in session creation form fetching open sessions for selected patient
- [ ] 6.2 Disable submit button and show warning if open session already exists
- [ ] 6.3 Add link to view existing open session from the warning message
- [ ] 6.4 Handle API 409 Conflict response with user-friendly message
- [ ] 6.5 Test race condition scenario (fast double-click) returns proper error

## 7. Backend Tests

- [ ] 7.1 Add tests for PATCH `/patients/:id` (successful update, 404, validation errors)
- [ ] 7.2 Add tests for DELETE `/patients/:id` (successful delete, 409 with open sessions, 404)
- [ ] 7.3 Add tests for POST `/sessions` duplicate prevention (accept if no open, reject if duplicate)
- [ ] 7.4 Add transaction isolation test for session duplicate race condition
- [ ] 7.5 Run npm test - all tests passing
- [ ] 7.6 Update existing smoke test if needed to cover new endpoints

## 8. Frontend Tests

- [ ] 8.1 Add tests for patient edit form submission (PATCH request, success/error handling)
- [ ] 8.2 Add tests for patient delete confirmation modal and DELETE request
- [ ] 8.3 Add tests for session creation form duplicate check (UI behavior)
- [ ] 8.4 Build frontend: npm run build - no TypeScript errors
- [ ] 8.5 Run ng test if unit tests configured (or manual validation)

## 9. Integration & Documentation

- [ ] 9.1 Test end-to-end flow: edit patient → start session fails if open exists → view existing
- [ ] 9.2 Update API documentation (README or OpenAPI spec) with new endpoints
- [ ] 9.3 Verify GitHub Actions CI passes for both backend tests and frontend build
- [ ] 9.4 Create PR with all changes and link to this change in OpenSpec
