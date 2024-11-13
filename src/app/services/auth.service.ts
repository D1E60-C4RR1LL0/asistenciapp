import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

interface UserData {
    email: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private afAuth: AngularFireAuth,
        private firestore: AngularFirestore,
        private storage: Storage,
        private router: Router
    ) {
        this.initStorage();
    }

    private async initStorage() {
        await this.storage.create();
    }

    async getCurrentUserId(): Promise<string | null> {
        const user = await this.afAuth.currentUser;
        return user ? user.uid : null;
    }

    async signUp(email: string, password: string, role: string, name: string) {
        try {
            const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
            const uid = result.user?.uid;

            await this.firestore.collection('users').doc(uid).set({
                email: email,
                name: name,
                role: role,
                classIds: []
            });

            await this.storage.set('userRole', role);
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            throw error;
        }
    }

    async signIn(email: string, password: string) {
        try {
            const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
            const userDoc = await this.firestore.collection('users').doc(userCredential.user?.uid).get().toPromise();

            if (userDoc && userDoc.exists) {
                const userData = userDoc.data() as UserData;
                await this.storage.set('userRole', userData.role);
                return userCredential;
            } else {
                throw new Error("No se pudo obtener el rol del usuario.");
            }
        } catch (error) {
            console.error("Error en la autenticación:", error);
            throw error;
        }
    }

    async signOut() {
        await this.storage.remove('userRole');
        await this.afAuth.signOut();
        this.router.navigate(['/login']);
    }

    // Función para obtener el siguiente ID de clase incrementado
    async getNextClassId(): Promise<string> {
        const counterRef = this.firestore.collection('counters').doc('classCounter');

        try {
            let nextCount = 0;

            await this.firestore.firestore.runTransaction(async transaction => {
                const counterDoc = await transaction.get(counterRef.ref);

                if (!counterDoc.exists) {
                    console.warn("Counter document not found, creating a new one with initial count 1.");
                    transaction.set(counterRef.ref, { count: 1 });
                    nextCount = 1;
                } else {
                    const counterData = counterDoc.data() as { count: number };
                    nextCount = (counterData.count || 0) + 1;
                    transaction.update(counterRef.ref, { count: nextCount });
                }
            });

            console.log("Next class ID generated:", nextCount);
            return nextCount.toString();
        } catch (error) {
            console.error("Error al obtener el próximo ID de clase:", error);
            throw error;
        }
    }

    async crearClase(claseNombre: string, profesorId: string): Promise<void> {
        try {
            const nextClassId = await this.getNextClassId();
            await this.firestore.collection('classes').doc(nextClassId).set({
                nombre: claseNombre,
                idProfesor: [profesorId],
                alumnoIds: [],
                currentSession: null,
                qrDisponible: false
            });
            console.log(`Clase creada con el ID: ${nextClassId}`);
        } catch (error) {
            console.error("Error al crear la clase:", error);
            throw error;
        }
    }

    async registrarAsistencia(alumnoId: string, classId: string, status: string) {
        const attendanceData = {
            alumnoId: alumnoId,
            classId: classId,
            date: new Date(),
            status: status
        };

        try {
            await this.firestore.collection('attendance').add(attendanceData);
            console.log("Asistencia registrada exitosamente");
        } catch (error) {
            console.error("Error al registrar asistencia:", error);
        }
    }
}
