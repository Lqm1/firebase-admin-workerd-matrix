# Measure Firebase Admin behavior by test case

The reference matrix inventories Node.js API presence, but an importable module may still fail when called in `workerd`. This project records each `firebase-admin` import and representative operation as a separate test case, compares it with a Node.js baseline under pinned versions, and uses local Firebase emulators for service operations. The matrix describes only the tested operations and emulator behavior; it does not claim that an entire service works in production.
