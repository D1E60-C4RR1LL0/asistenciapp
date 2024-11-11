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
        // Inicializa el almacenamiento
        this.initStorage();
    }

    private async initStorage() {
        await this.storage.create();
    }

    // Método para obtener el ID del usuario autenticado actual
    async getCurrentUserId(): Promise<string | null> {
        const user = await this.afAuth.currentUser;
        return user ? user.uid : null;
    }

    // Función de registro con rol
    async signUp(email: string, password: string, role: string, name: string) {
        try {
            const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
            const uid = result.user?.uid;

            await this.firestore.collection('users').doc(uid).set({
                email: email,
                name: name,
                role: role,
                classIds: []  // agregar clases más adelante si es necesario
            });

            await this.storage.set('userRole', role);
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            throw error;
        }
    }

    // Función de inicio de sesión que recupera el rol del usuario
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

    // Cerrar sesión
    async signOut() {
        await this.storage.remove('userRole');
        await this.afAuth.signOut();
        this.router.navigate(['/login']);
    }

    async registrarAsistencia(alumnoId: string, classId: string, status: string) {
        const attendanceData = {
            alumnoId: alumnoId,
            classId: classId,
            date: new Date(),  // Fecha actual
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
