import 'github-markdown-css/github-markdown.css';
import get from 'lodash/get';
import { updateRequestDocs } from 'providers/ReduxStore/slices/collections';
import { useTheme } from 'providers/Theme';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import Markdown from 'components/MarkDown';
import CodeEditor from 'components/CodeEditor';
import StyledWrapper from './StyledWrapper';

const Documentation = ({ item, collection }) => {
  const dispatch = useDispatch();
  const { storedTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [docs, setDocs] = useState(item.draft ? get(item, 'draft.request.docs') : get(item, 'request.docs'));
  const preferences = useSelector((state) => state.app.preferences);

  useEffect(() => {
    onEdit(docs);
  }, [docs]);

  const autoGenerate = () => {
    const body =
      item?.request?.body?.json
        ?.toString()
        .replaceAll(/,/g, ',\n')
        .replaceAll(/{/g, '\t{\n')
        .replaceAll(/}/g, '\t  }')
        .replaceAll(/\n\n/g, '\n\n\t')
        .replaceAll(/\s*:\s*{/g, ': {')
        .replaceAll(/\t  }$/g, '\n\t}') || '';

    const docs = `**URL :**\n
    ${item.request.url}
    \n**Method :**\n
    ${item.request.method}
    \n${item.request.headers.length !== 0 ? '**Headers :**' : ''}
    \n\t${item.request.headers.map((header) => `${header.name} : ${header.value}`).join('\n\t')}
    \n${item.request.body.json ? '**Body :**' : ''}
    \n${body}\n`;

    setDocs(docs);
  };

  const addResponse = () => {
    const response = JSON.stringify(item?.response?.data?.data || '', null, 2);

    const formattedResponse = response
      .split('\n')
      .map((line) => `\t${line}`)
      .join('\n');

    setDocs(`${docs}\n\n${item.response.data.data ? '**Response :** ' + item.response.status : ''}\n
        \n${item.response.data.data ? formattedResponse : ''}`);
  };

  const toggleViewMode = () => {
    setIsEditing((prev) => !prev);
  };

  const onEdit = (value) => {
    dispatch(
      updateRequestDocs({
        itemUid: item.uid,
        collectionUid: collection.uid,
        docs: value
      })
    );
  };

  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

  if (!item) {
    return null;
  }

  return (
    <StyledWrapper className="mt-1 h-full w-full relative">
      <div className="flex mb-2">
        <div className="editing-mode" role="tab" onClick={toggleViewMode}>
          {isEditing ? 'Preview' : 'Edit'}
        </div>

        <div className="editing-mode ml-5" role="tab" onClick={autoGenerate}>
          Auto-Generate
        </div>

        {item?.response?.data?.data && (
          <div className="editing-mode ml-5" role="tab" onClick={addResponse}>
            Add Response
          </div>
        )}
      </div>

      {isEditing ? (
        <CodeEditor
          collection={collection}
          theme={storedTheme}
          font={get(preferences, 'font.codeFont', 'default')}
          value={docs || ''}
          onEdit={onEdit}
          onSave={onSave}
          mode="application/text"
        />
      ) : (
        <Markdown onDoubleClick={toggleViewMode} content={docs} />
      )}
    </StyledWrapper>
  );
};

export default Documentation;
