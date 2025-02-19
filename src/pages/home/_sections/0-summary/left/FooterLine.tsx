import { styled } from '@mui/material/styles';
import React from 'react';
import { Body } from '../../../_components/typography';

const Logo = styled('img')(({theme}) => ({
  verticalAlign: 'text-bottom',
  marginLeft: theme.spacing(1),
}))

const FooterLine = () => {
  return (
    <Body>
      Powered by
      <a href="https://en.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral" target="_blank">
        <Logo src='/img/tidb-logo-o.png' height={20} alt='TiDB' />
      </a>
    </Body>
  )
}

export default FooterLine
