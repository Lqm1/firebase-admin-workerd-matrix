# Firebase Admin workerd compatibility

This project records which `firebase-admin` imports and operations work in `workerd`.

## Language

**Test case**:
One `firebase-admin` import or representative operation evaluated on its own.

**Compatibility result**:
A record of whether one test case behaved as expected with a specific `firebase-admin` and `workerd` version pair. It is not a verdict on the entire SDK.

**Compatibility matrix**:
A list of compatibility results by test case.

**Incomparable**:
A test case whose Node.js baseline failed, so a `workerd`-specific compatibility result cannot be determined.
