## Corrections Made

### 1. Removed derived fields to prevent inconsistency
- **File**: `backend/src/domain/activity-metrics.ts`
- **Change**: Removed `averageSpeedMps` and `maxSpeedMps` from `ActivityMetrics` interface.
- **Reason**: These fields are derivable from `distanceMeters` and `durationSeconds`; storing them risks inconsistency if only one side is updated.

### 2. Strengthened plan-activity link validation
- **File**: `backend/src/domain/activity.ts`
- **Changes** in `ActivityValidation.validatePlanLink`:
  - Added check that `plan.userId === activity.userId`.
  - Added check that `plan.sportType === activity.sportType`.
  - Kept the 2‑hour time proximity check.
- **Added validations**:
  - `validateNotesLength`: limits notes to 500 characters.
  - `validateMediaUrlsCount`: limits `mediaUrls` array to 10 items.

### 3. Fixed TypeORM entity syntax errors
- **Files**:
  - `backend/src/infrastructure/database/entities/ActivityEntity.ts`
  - `backend/src/infrastructure/database/entities/ActivityPlanEntity.ts`
- **Changes**: Removed extra closing braces and ensured proper import of `Index` from `typeorm`.
- **Result**: Entities now compile without TS errors.

### 4. Verified that no existing functionality was broken
- **Tests**: All unit tests pass (`npm test`).
- **TypeScript**: `tsc --noEmit` exits with code 0 (no errors).

## Points Intentionally Left for Future Work

As instructed, we did **not**:
- Add a visibility/sharing field to `ActivityPlan`.
- Move social‑adjacent fields (`isShared`, `visibility`, `notes`, `mediaUrls`) out of `Activity` into dedicated entities (e.g., `ActivityVisibility`, `ActivityComment`, `ActivityReaction`, `ActivityShare`).
- Augment `Location` with accuracy/precision fields (e.g., `horizontalAccuracyMeters`).
- Replace `OtherSportSpecificData` with a more type‑safe extensible pattern.
- Implement service‑level privacy filtering for discovery/matching endpoints.
- Build frontend, authentication, social features, matching, groups, or challenges.

These items remain for later phases and are explicitly out of scope for this correction round.

## Summary

The domain model now satisfies the core principles:
- `Activity` ≠ `ActivityPlan` (optional link, no automatic conversion).
- Clear separation of generic metrics and sport‑specific data.
- Multisport‑native via discriminated union.
- Basic privacy controls (`visibility` field).
- Validation prevents inconsistent or nonsensical data.

The corrected code is ready for subsequent layers (application, API) to be built upon it.