import React, { useState } from 'react'
import {Form, Input, Grid, Label, Icon, Dropdown, Button} from 'semantic-ui-react'
import { TxButton } from './substrate-lib/components'
import { useSubstrateState } from './substrate-lib'
import { Keyring } from '@polkadot/keyring';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import {u8aToHex} from "@polkadot/util";

export default function Main(props) {
  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ addressTo: '', amount: 0 })

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }))

  const { addressTo, amount } = formState

  const { keyring,api } = useSubstrateState()
  const accounts = keyring.getPairs()

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
  })
  const txResHandler = ({ status }) => {
    status.isFinalized
        ? setStatus(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
        : setStatus(`Current transaction status: ${status.type}`)
  }


  const txErrHandler = err =>
      setStatus(`😞 Transaction Failed: ${err.toString()}`)

  const faucet = async (ts) => {
    //powder ketchup mix crew achieve oblige coffee sick problem mango weekend purity
    //5Fji96XCbNsseKSFJCdvym9j3nTQz4ecS8S1J7esFsKEVN3x
    const mnemonic = "powder ketchup mix crew achieve oblige coffee sick problem mango weekend purity";
    const keyring = new Keyring({ type: 'sr25519'});
    const bot = keyring.addFromUri(mnemonic);
    const addressTo = document.getElementById('addressTo').value;
    const status = await api.tx['balances']['transfer'](addressTo, "10000000000000000000")
        .signAndSend(bot,txResHandler).catch(txErrHandler())
  }

  return (
        <Grid.Column width={8}>
          <h1>Faucet</h1>
          <Form>
            <Form.Field>
              <Label
                  basic
                  color="teal"
              >
                <Icon name="hand point right" />
                Click once to get 10 NB
              </Label><br/>
              <Label basic
                     color="teal"
                     style={{ marginLeft: 0, marginTop: '.5em' }}>
                <Icon name="hand point right" />Please don't get too much. The number of faucets is limited&nbsp;
              </Label>
            </Form.Field>

            <Form.Field>
              <Dropdown
                  placeholder="Select from available addresses"
                  fluid
                  selection
                  search
                  options={availableAccounts}
                  state="addressTo"
                  onChange={onChange}
              />
            </Form.Field>

            <Form.Field>
              <Input
                  id="addressTo"
                  fluid
                  label="To"
                  type="text"
                  placeholder="address"
                  value={addressTo}
                  state="addressTo"
                  onChange={onChange}
              />
            </Form.Field>

            <Form.Field style={{ textAlign: 'center' }}>
              <Button
                  basic
                  color="blue"
                  state="addressTo"
                  onClick={() => faucet()}
              >
                Get
              </Button>
            </Form.Field>
            <div style={{ overflowWrap: 'break-word' }}>{status}</div>
          </Form>
        </Grid.Column>
  )
}
