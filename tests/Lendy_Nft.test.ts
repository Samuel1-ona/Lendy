
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { standardPrincipalCV } from "@stacks/transactions";




describe("Test Lendy_Nft minting function ", () => {
it("should mint the lendy nft to the address" , () => {
  const accounts = simnet.getAccounts();
  const wallet = accounts.get("wallet_1")!;

  const {result: mint1} =  simnet.callPublicFn("Lendy_Nft", "mint", [standardPrincipalCV(wallet)], simnet.deployer);
  expect(mint1).toBeOk(Cl.uint(1));

  const {result: token_id} =  simnet.callReadOnlyFn("Lendy_Nft", "get-last-token-id", [], wallet);
  expect(token_id).toBeOk(Cl.uint(1));

  const {result: owner} =  simnet.callReadOnlyFn("Lendy_Nft", "get-owner", [Cl.uint(1)], wallet);
  expect(owner).toBeOk(Cl.some(standardPrincipalCV(wallet)));

  const {result: mint2} =  simnet.callPublicFn("Lendy_Nft", "mint", [standardPrincipalCV(wallet)], simnet.deployer);
  expect(mint2).toBeOk(Cl.uint(2));

  const {result: token_id2} =  simnet.callReadOnlyFn("Lendy_Nft", "get-last-token-id", [], wallet);
  expect(token_id2).toBeOk(Cl.uint(2));

  const {result: transfer} = simnet.callPublicFn("Lendy_Nft", "transfer", [Cl.uint(1), standardPrincipalCV(wallet), standardPrincipalCV(accounts.get("wallet_2")!)], wallet);
  expect(transfer).toBeOk(Cl.bool(true));

  const {result: burn1} = simnet.callPublicFn("Lendy_Nft", "burn", [Cl.uint(1)], simnet.deployer);
  expect(burn1).toBeOk(Cl.bool(true));

  const {result: owner2} = simnet.callReadOnlyFn("Lendy_Nft", "get-owner", [Cl.uint(1)], wallet);
  expect(owner2).toBeOk(Cl.none());
  
});
}); 