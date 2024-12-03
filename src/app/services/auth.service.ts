import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { enableIndexedDbPersistence } from 'firebase/firestore';


interface UserData {
    email: string;
    role: string;
}

// Asistencia Offline 
interface asistenciasOffline {
    classId: string;
    alumnoId: string;
    date: Date;
    status: string;
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
    
        // Detectar cuando el dispositivo recupera conexión
        window.addEventListener('online', async () => {
            console.log("Conexión restaurada. Sincronizando datos offline...");
            await this.syncDataToFirestore();
        });
    }
    private async initStorage() {
        try {
            await this.storage.create();
            console.log("Storage inicializado correctamente.");
        } catch (error) {
            console.error("Error al inicializar el almacenamiento:", error);
        }
    }
    
async syncDataToLocal() {
    try {
        // Sincronizar clases
        const classesSnapshot = await this.firestore.collection('classes').get().toPromise();
        if (!classesSnapshot || classesSnapshot.empty) {
            console.warn("No se encontraron clases en la base de datos.");
            return;
        }

        const classes = classesSnapshot.docs.map(doc => {
            const data = doc.data(); // Obtener datos del documento
            return {
                id: doc.id, // Agregar el ID del documento como parte del objeto
                ...(data || {}), // Asegurarse de que data no sea null o undefined
            };
        });

        await this.storage.set('classes', classes);
        console.log("Clases sincronizadas al almacenamiento local.");

        // Sincronizar sesiones para cada clase
        for (const clase of classes) {
            const sessionsSnapshot = await this.firestore
                .collection('classes')
                .doc(clase.id)
                .collection('sessions')
                .get()
                .toPromise();

            if (!sessionsSnapshot || sessionsSnapshot.empty) {
                console.warn(`No se encontraron sesiones para la clase ${clase.id}.`);
                continue;
            }

            const sessions = sessionsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...(data || {}),
                };
            });

            await this.storage.set(`sessions_${clase.id}`, sessions);
            console.log(`Sesiones de la clase ${clase.id} sincronizadas al almacenamiento local.`);
        }

        // Sincronizar usuarios (alumnos y profesores)
        const usersSnapshot = await this.firestore.collection('users').get().toPromise();
        if (!usersSnapshot || usersSnapshot.empty) {
            console.warn("No se encontraron usuarios en la base de datos.");
            return;
        }

        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...(data || {}),
            };
        });

        await this.storage.set('users', users);
        console.log("Usuarios sincronizados al almacenamiento local.");
    } catch (error) {
        console.error("Error al sincronizar datos al almacenamiento local:", error);
    }
}


    // Obtener clases desde el almacenamiento local
    async getClasses(): Promise<any[]> {
        const localClasses = await this.storage.get('classes');
        return localClasses || [];
    }

    // Obtener sesiones de una clase desde el almacenamiento local
    async getSessionsForClass(classId: string): Promise<any[]> {
        const localSessions = await this.storage.get(`sessions_${classId}`);
        return localSessions || [];
    }

    // Obtener usuarios desde el almacenamiento local
    async getUsers(): Promise<any[]> {
        const localUsers = await this.storage.get('users');
        return localUsers || [];
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

    async registrarAsistencia(alumnoId: string, classId: string, status: string) {
        const attendanceData = {
            alumnoId,
            classId,
            date: new Date(),
            status,
        };
    
        try {
            // Intentar guardar en Firestore
            await this.firestore.collection('classes')
                .doc(classId)
                .collection('sessions')
                .doc('offline-session')
                .collection('attendance')
                .doc(alumnoId)
                .set(attendanceData);
            console.log("Asistencia registrada exitosamente online.");
        } catch (error) {
            // Si falla, guardar offline
            console.error("Error al registrar asistencia online. Guardando offline...");
            await this.saveAsistenciaOffline(attendanceData);
        }
    }

    // Guardar asistencia offline
    async saveAsistenciaOffline(attendance: asistenciasOffline) {
        const storedData = await this.storage.get('asistenciasOffline');
        const attendances: asistenciasOffline[] = storedData ? JSON.parse(storedData) : [];
        attendances.push(attendance);
        await this.storage.set('asistenciasOffline', JSON.stringify(attendances));
        console.log("Asistencia guardada offline.");
    }

    // Sincronizar asistencias offline con Firestore
    async syncAsistenciasOffline() {
        const storedData = await this.storage.get('asistenciasOffline');
        const attendances: asistenciasOffline[] = storedData ? JSON.parse(storedData) : [];

        for (const attendance of attendances) {
            try {
                const claseDoc = await this.firestore.collection('classes').doc(attendance.classId).get().toPromise();
                const currentSessionId = (claseDoc?.data() as { currentSession?: string }).currentSession;

                if (!currentSessionId) {
                    console.error(`No hay sesión activa para la clase ${attendance.classId}.`);
                    continue;
                }

                await this.firestore
                    .collection('classes')
                    .doc(attendance.classId)
                    .collection('sessions')
                    .doc(currentSessionId)
                    .collection('attendance')
                    .doc(attendance.alumnoId)
                    .set({
                        alumnoId: attendance.alumnoId,
                        date: attendance.date,
                        status: attendance.status,
                    });
                console.log(`Asistencia sincronizada para alumno ${attendance.alumnoId} en sesión ${currentSessionId}.`);
            } catch (error) {
                console.error("Error al sincronizar asistencia offline:", error);
            }
        }

        await this.storage.remove('asistenciasOffline');
        console.log("Asistencias offline sincronizadas y limpiadas.");
    }

    // Sincronizar todos los datos offline con Firestore
    async syncDataToFirestore() {
        await this.syncAsistenciasOffline();
        // Agrega otras sincronizaciones si es necesario
    }
}
