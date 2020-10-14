import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlockchainViewerComponent } from './pages/blockchain-viewer/blockchain-viewer.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { CreateTransactionComponent } from './pages/create-transaction/create-transaction.component';
import { PendingTransactionsComponent } from './pages/pending-transactions/pending-transactions.component';
import { HomeComponent } from './pages/home/home.component'
import { AccountComponent } from './pages/account/account.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'blockchain', component: BlockchainViewerComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'transaction', component: CreateTransactionComponent},
  {path: 'pending', component: PendingTransactionsComponent},
  {path: 'account', component: AccountComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
