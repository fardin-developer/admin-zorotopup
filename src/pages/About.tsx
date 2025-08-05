import {  Flex,  } from 'antd';
import { useStylesContext } from '../context';
import {
  HomeOutlined,
  PieChartOutlined,
} from '@ant-design/icons';

import { DASHBOARD_ITEMS, } from '../constants';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components';




export const AboutPage = () => {
  const context = useStylesContext();

  return (
    <div>
      <Flex vertical gap="middle">
        <PageHeader
          title="About"
          breadcrumbs={[
            {
              title: (
                <>
                  <HomeOutlined />
                  <span>home</span>
                </>
              ),
              path: '/',
            },
            {
              title: (
                <>
                  <PieChartOutlined />
                  <span>dashboards</span>
                </>
              ),
              menu: {
                items: DASHBOARD_ITEMS.map((d) => ({
                  key: d.title,
                  title: <Link to={d.path}>{d.title}</Link>,
                })),
              },
            },
            {
              title: 'about',
            },
          ]}
        />

      </Flex>
    </div>
  );
};
