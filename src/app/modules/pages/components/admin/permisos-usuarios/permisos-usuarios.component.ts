/* eslint-disable no-param-reassign */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { UserService, AuthService } from '../../../../../services';
import { User } from '../../../../../models/user.model';

@Component({
  selector: 'app-permisos-usuarios',
  templateUrl: './permisos-usuarios.component.html',
  styleUrls: ['./permisos-usuarios.component.css'],
})

export class PermisosUsuariosComponent implements OnInit {
  users: User[] = [];

  admins: User[] = [];

  usersCount: number = 0;

  adminsCount: number = 0;

  usersPageCount: number = 0;

  adminsPageCount: number = 0;

  usersCurrentPage: number = 0;

  adminsCurrentPage: number = 0;

  usersCurrentPages: number[] = [];

  adminsCurrentPages: number[] = [];

  usersSearch: string = '';

  adminsSearch: string = '';

  message: string = '';

  successAlert: boolean = false;

  errorAlert: boolean = false;

  currentUser: Partial<User> | undefined = undefined;

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.init('');
  }

  init(busqueda: string) {
    this.currentUser = this.authService.getUser();
    this.userService.getUsers('clients', 4, 0, busqueda).subscribe(
      (res) => {
        this.usersCount = res.count;
        res.rows.forEach((user: User) => {
          const datepipe: DatePipe = new DatePipe('esUY');
          const formattedDate = datepipe.transform(user.createdAt, 'MMM d, y, h:mm:ss a');
          if (formattedDate) {
            user.createdAt = formattedDate;
          } else {
            user.createdAt = '?';
          }
          this.users.push(user);
        });
        this.usersPageCount = Math.ceil(this.usersCount / 4);
        if (this.usersPageCount > 0) {
          this.goToUserPage(1);
        }
      },
      (err) => {
        console.error(err);
      },
    );
    this.userService.getUsers('admins', 4, 0, busqueda).subscribe(
      (res) => {
        this.adminsCount = res.count;
        res.rows.forEach((user: User) => {
          const datepipe: DatePipe = new DatePipe('esUY');
          const formattedDate = datepipe.transform(user.createdAt, 'MMM d, y, h:mm:ss a');
          if (formattedDate) {
            user.createdAt = formattedDate;
          } else {
            user.createdAt = '?';
          }
          this.admins.push(user);
        });
        this.adminsPageCount = Math.ceil(this.adminsCount / 4);
        if (this.adminsPageCount > 0) {
          this.goToAdminPage(1);
        }
      },
      (err) => {
        console.error(err);
      },
    );
  }

  goToUserPage(page: number) {
    if (page >= 1 && page <= this.usersPageCount) {
      this.userService.getUsers('clients', 4, (page - 1) * 4, this.usersSearch).subscribe(
        (res) => {
          this.usersCurrentPage = page;
          this.usersCount = res.count;
          this.users = [];
          res.rows.forEach((user: User) => {
            const datepipe: DatePipe = new DatePipe('esUY');
            const formattedDate = datepipe.transform(user.createdAt, 'MMM d, y, h:mm:ss a');
            if (formattedDate) {
              user.createdAt = formattedDate;
            } else {
              user.createdAt = '?';
            }
            this.users.push(user);
          });
          this.usersPageCount = Math.ceil(this.usersCount / 4);
          if (page === 1) {
            this.usersCurrentPages = Array(Math.min((page + 2),
              this.usersPageCount)).fill(undefined).map((_, idx) => 1 + idx);
          } else if (page === this.usersPageCount) {
            this.usersCurrentPages = Array(page - Math.max((page - 2), 1) + 1)
              .fill(undefined).map((_, idx) => Math.max((page - 2), 1) + idx);
          } else {
            this.usersCurrentPages = Array((page + 1) - (page - 1) + 1)
              .fill(undefined).map((_, idx) => (page - 1) + idx);
          }
        },
        (err) => {
          console.error(err);
        },
      );
    }
  }

  goToAdminPage(page: number) {
    if (page >= 1 && page <= this.adminsPageCount) {
      this.userService.getUsers('admins', 4, (page - 1) * 4, this.adminsSearch).subscribe(
        (res) => {
          this.adminsCurrentPage = page;
          this.adminsCount = res.count;
          this.admins = [];
          res.rows.forEach((user: User) => {
            const datepipe: DatePipe = new DatePipe('esUY');
            const formattedDate = datepipe.transform(user.createdAt, 'MMM d, y, h:mm:ss a');
            if (formattedDate) {
              user.createdAt = formattedDate;
            } else {
              user.createdAt = '?';
            }
            this.admins.push(user);
          });
          this.adminsPageCount = Math.ceil(this.adminsCount / 4);
          if (page === 1) {
            this.adminsCurrentPages = Array(Math.min((page + 2),
              this.adminsPageCount)).fill(undefined).map((_, idx) => 1 + idx);
          } else if (page === this.adminsPageCount) {
            this.adminsCurrentPages = Array(page - Math.max((page - 2), 1) + 1)
              .fill(undefined).map((_, idx) => Math.max((page - 2), 1) + idx);
          } else {
            this.adminsCurrentPages = Array((page + 1) - (page - 1) + 1)
              .fill(undefined).map((_, idx) => (page - 1) + idx);
          }
        },
        (err) => {
          console.error(err);
        },
      );
    }
  }

  goToPreviousUserPage() {
    if (this.usersPageCount > 0 && this.usersCurrentPage !== 1) {
      this.goToUserPage(this.usersCurrentPage - 1);
    }
  }

  goToNextUserPage() {
    if (this.usersPageCount > 0 && this.usersCurrentPage !== this.usersPageCount) {
      this.goToUserPage(this.usersCurrentPage + 1);
    }
  }

  goToPreviousAdminPage() {
    if (this.adminsPageCount > 0 && this.adminsCurrentPage !== 1) {
      this.goToAdminPage(this.adminsCurrentPage - 1);
    }
  }

  goToNextAdminPage() {
    if (this.adminsPageCount > 0 && this.adminsCurrentPage !== this.adminsPageCount) {
      this.goToAdminPage(this.adminsCurrentPage + 1);
    }
  }

  giveAdminPermission(id: number, name: string) {
    Swal.fire({
      title: 'Confirmar',
      text: `Dar permisos de Administrador a ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.giveAdminPermission(id).subscribe(
          () => {
            Swal.fire(
              '¡Éxito!',
              `Se han otorgado permisos de Administrador para ${name}.`,
            );
            this.users = [];
            this.admins = [];
            this.usersCount = 0;
            this.adminsCount = 0;
            this.usersPageCount = 0;
            this.adminsPageCount = 0;
            this.usersCurrentPage = 0;
            this.adminsCurrentPage = 0;
            this.usersCurrentPages = [];
            this.adminsCurrentPages = [];
            this.usersSearch = '';
            this.adminsSearch = '';
            this.init('');
          },
          (err) => {
            Swal.fire(
              '¡Error!',
              'Hubo un problema',
            );
            console.error(err);
          },
        );
      }
    });
  }

  removeAdminPermission(id: number, name: string) {
    Swal.fire({
      title: 'Confirmar',
      text: `Quitar permisos de Administrador a ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.removeAdminPermission(id).subscribe(
          () => {
            Swal.fire(
              '¡Éxito!',
              `Se le han quitado los permisos de Administrador a ${name}.`,
            );
            this.users = [];
            this.admins = [];
            this.usersCount = 0;
            this.adminsCount = 0;
            this.usersPageCount = 0;
            this.adminsPageCount = 0;
            this.usersCurrentPage = 0;
            this.adminsCurrentPage = 0;
            this.usersCurrentPages = [];
            this.adminsCurrentPages = [];
            this.usersSearch = '';
            this.adminsSearch = '';
            this.init('');
          },
          (err) => {
            Swal.fire(
              '¡Error!',
              'Hubo un problema',
            );
            console.error(err);
          },
        );
      }
    });
  }

  mostrarAceptados() {
    const section = document.querySelector('section');
    if (section != null) {
      section.classList.add('active');
    }
  }

  mostrarPendientes() {
    const section = document.querySelector('section');
    if (section != null) {
      section.classList.remove('active');
    }
  }

  closeAlert() {
    this.message = '';
    this.successAlert = false;
    this.errorAlert = false;
  }

  searchAdmins() {
    const busquedaInput: any = document.getElementById('busquedaAdministradores');
    if (busquedaInput) {
      this.adminsSearch = busquedaInput.value;
      this.userService.getUsers('admins', 4, 0, this.adminsSearch).subscribe(
        (res) => {
          this.message = '';
          this.successAlert = false;
          this.errorAlert = false;
          this.admins = [];
          this.adminsCount = 0;
          this.adminsPageCount = 0;
          this.adminsCurrentPage = 0;
          this.adminsCurrentPages = [];
          this.adminsCount = res.count;
          this.admins = res.rows;
          this.adminsPageCount = Math.ceil(this.adminsCount / 4);
          if (this.adminsPageCount > 0) {
            this.goToAdminPage(1);
          }
        },
        (err) => {
          console.error(err);
        },
      );
    }
  }

  searchUsers() {
    const busquedaInput: any = document.getElementById('busquedaUsuarios');
    if (busquedaInput) {
      this.usersSearch = busquedaInput.value;
      this.userService.getUsers('clients', 4, 0, this.usersSearch).subscribe(
        (res) => {
          this.message = '';
          this.successAlert = false;
          this.errorAlert = false;
          this.users = [];
          this.usersCount = 0;
          this.usersPageCount = 0;
          this.usersCurrentPage = 0;
          this.usersCurrentPages = [];
          this.usersCount = res.count;
          this.users = res.rows;
          this.usersPageCount = Math.ceil(this.usersCount / 4);
          if (this.usersPageCount > 0) {
            this.goToUserPage(1);
          }
        },
        (err) => {
          console.error(err);
        },
      );
    }
  }

  resetUsersSearch() {
    const busquedaInput: any = document.getElementById('busquedaUsuarios');
    if (busquedaInput) {
      busquedaInput.value = '';
      this.searchUsers();
    }
  }

  resetAdminsSearch() {
    const busquedaInput: any = document.getElementById('busquedaAdministradores');
    if (busquedaInput) {
      busquedaInput.value = '';
      this.searchAdmins();
    }
  }
}
