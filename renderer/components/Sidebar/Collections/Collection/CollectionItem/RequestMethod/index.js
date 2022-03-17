import React from 'react';
import classnames from 'classnames';
import StyledWrapper from './StyledWrapper';

const RequestMethod = ({item}) => {
  if(!['http-request', 'graphql-request'].includes(item.type)) {
    return null;
  }

  const getClassname = (method = '') => {
    method = method.toLocaleLowerCase();
    return classnames("mr-1", {
      'method-get': method === 'get',
      'method-post': method === 'post',
      'method-put': method === 'put',
      'method-delete': method === 'delete',
      'method-patch': method === 'patch'
    });
  };

  return (
    <StyledWrapper>
      <div className={getClassname(item.request.method)}>
        <span>{item.request.method}</span>
      </div>
    </StyledWrapper>
  );
};

export default RequestMethod;