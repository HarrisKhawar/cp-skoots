import { Component, OnInit } from '@angular/core';
import { BlockchainService } from 'src/app/services/blockchain.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  public balance;
  public transactionHistory = [];

  constructor(private blockchainService: BlockchainService) {
    this.balance = blockchainService.getBalance();
    this.transactionHistory = blockchainService.getTransactionHistory();
   }

  ngOnInit() {
  }

}
