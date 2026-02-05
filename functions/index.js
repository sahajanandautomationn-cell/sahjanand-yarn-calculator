const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// 1. Create Operator (Admin Only)
exports.createOperator = functions.https.onCall(async (data, context) => {
    // Check if requester is admin
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only admins can create users.'
        );
    }

    const { email, password } = data;

    try {
        // A. Create User in Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        // B. Set Custom Claims (Role: user)
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });

        // C. Create Firestore Document
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            email: email,
            role: 'user',
            active: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, uid: userRecord.uid };

    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// 2. Toggle User Access (Admin Only)
exports.toggleUserAccess = functions.https.onCall(async (data, context) => {
    // Check if requester is admin
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can manage access.');
    }

    const { uid, active } = data; // active: true/false

    try {
        // A. Update Firestore
        await admin.firestore().collection('users').doc(uid).update({
            active: active
        });

        // B. Update Auth Status (Disable/Enable account)
        await admin.auth().updateUser(uid, {
            disabled: !active
        });

        return { success: true };

    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// 3. Delete User (Optional)
exports.deleteUser = functions.https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users.');
    }
    const { uid } = data;
    try {
        await admin.auth().deleteUser(uid);
        await admin.firestore().collection('users').doc(uid).delete();
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});
