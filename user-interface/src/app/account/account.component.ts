import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from "../service/authentication.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material";
import {IncomeDialogComponent} from "../income-dialog/income-dialog.component";
import {AccountService} from "../service/account.service";

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

    constructor(private authService: AuthenticationService, private router: Router, public dialog: MatDialog,
                private accountService: AccountService) {
    }

    ngOnInit() {
        this.authService.checkCredentials();
        this.accountService.getCurrentAccount().subscribe(result => {
            console.log(result);
            //TODO
        })
    }

    public navigateToStatistics() {
        this.router.navigate(['/statistics'])
    }

    public openAddIncome() {
        const dialogRef = this.dialog.open(IncomeDialogComponent, {
            width: '250px',
            data: "Add Income"
        });
    }

}
