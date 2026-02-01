import { Button, CircularProgress, FormControl, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import TextInputField from '@/components/fields/TextInputField';
import DatePickerField from '@/components/fields/DatePickerField';
import { Editor } from 'primereact/editor';
import TextAreaField from '@/components/fields/TextAreaField';
import { API } from '@/lib/config/api';
import { createMusyawarah, rangkumMusyawarah, updateDataMusyawarah } from '@/store/actions/musyawarah.action';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

function Form({ isEdit = false}) {
  const router = useRouter();
  const [text, setText] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState(null);
  const dispatch = useDispatch();
  const hasNotes = React.useMemo(() => stripHtml(text).length > 0, [text]);
  const { isLoadingCreate, summary: summaryFromStore, detail } = useSelector((state) => state.musyawarah);
  
  const requestSummary = React.useCallback(async () => {
    if (!hasNotes) {
      setSummaryError('Catatan musyawarah belum diisi.');
      return '';
    }

    try {
      setIsSummarizing(true);
      setSummaryError(null);
      const response = await dispatch(rangkumMusyawarah({
        payload: {
          notes: stripHtml(text),
        }
      })).unwrap();
    } catch (error) {
      console.error('GENERATE MUSYAWARAH SUMMARY ERROR:', error);
      const message = error?.response?.data?.message;
      setSummaryError(
        message === 'missing_openai_key'
          ? 'AI summary belum diaktifkan di server.'
          : 'Gagal membuat ringkasan otomatis.'
      );
      return '';
    } finally {
      setIsSummarizing(false);
    }
  }, [hasNotes, text]);

  React.useEffect(() => {
    if (summaryFromStore) {
      setSummary(summaryFromStore);
    }
  }, [summaryFromStore]);

  const handleGenerateSummary = React.useCallback(async () => {
    await requestSummary();
  }, [requestSummary]);
  
  async function onSubmit(values) {
    const autoSummary = summary || (await requestSummary());
    const payload = {
      ...values,
      topic: values.topic.toLowerCase(),
      notes: text,
      summary: autoSummary || '',
    };
    if (isEdit) {
      // dispatch update action
      dispatch(updateDataMusyawarah({id: detail.id, payload: payload}));
      return;
    }
    dispatch(createMusyawarah({payload: payload}));

  }
  const form = useFormik({
    initialValues: {
      // form initial values here
      topic: '',
      date: '',
    },
    onSubmit: async (values) => {
      // form submission logic here
      await onSubmit(values);
    },
  });
  React.useEffect(() => {
    form.resetForm();
    setText('');
    setSummary('');
  },[]);
  React.useEffect(() => {
    if (isEdit && detail) {
      form.setValues({
        topic: detail.topic || '',
        date: detail.date || '',
      });
      setText(detail.notes || '');
      setSummary(detail.summary || '');
    }
  }, [isEdit, detail]);
  function copyToClipboard() {
    navigator.clipboard.writeText(summary).then(() => {
      alert('Ringkasan musyawarah berhasil disalin ke clipboard.');
    }, (err) => {
      alert('Gagal menyalin ringkasan musyawarah: ', err);
    });
  }
  return (
    <div>
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">{isEdit ? 'Edit Musyawarah' : 'Buat Musyawarah'}</div>
          <div className="text-[#666] text-[13px]">Lengkapi data musyawarah dengan benar.</div>
        </div>
      </div>

        <form action="" onSubmit={form.handleSubmit} className="w-full mt-6">
          <FormControl fullWidth margin="normal">
            <TextInputField
              label="Topik Musyawarah"
              name="topic"
              value={form.values.topic}
              onChange={(name, value) => form.setFieldValue(name, value)}
              id={'topic'}
              size={'small'}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <DatePickerField
              label="Tanggal Musyawarah"
              name="date"
              value={form.values.date}
              onChange={(name, value) => form.setFieldValue(name, value)}
              id={'date'}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <Editor value={text} name='notes' onTextChange={(e) => setText(e.htmlValue)} style={{ height: '320px' }} />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#4F4F4F] font-medium text-[13px]">Ringkasan Musyawarah</span>
              <Button
                variant="outlined"
                size="small"
                onClick={handleGenerateSummary}
                disabled={!hasNotes || isSummarizing}
              >
                {isSummarizing ? (
                  <span className="flex items-center gap-2">
                    <CircularProgress size={16} />
                    Memproses
                  </span>
                ) : (
                  'Generate dengan AI'
                )}
              </Button>
            </div>
            <TextAreaField
              id={'summary'}
              label={''}
              name="summary"
              placeholder="Ringkasan otomatis akan muncul di sini dan dapat diedit manual."
              value={summary}
              onChange={(name, value) => {
                setSummary(value);
                if (summaryError) setSummaryError(null);
              }}
              disabled={isSummarizing}
              row={'4'}
            />
            {summaryError && <p className="text-sm text-red-500 mt-2">{summaryError}</p>}
          </FormControl>
          <div className="">
            <Button variant="text" color="secondary" onClick={() => copyToClipboard()} startIcon={<ContentCopyIcon />} disabled={!summary}>
              Copy Rangkuman
            </Button>
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit" variant="contained" color="primary" disabled={isSummarizing}>
              {isEdit ? 'Update Musyawarah' : 'Buat Musyawarah'}
            </Button>
          </div>
        </form>
    </div>
  )
}

export default Form