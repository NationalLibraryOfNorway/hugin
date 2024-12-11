import {ChangeEvent, FC} from 'react';
import {Field} from 'formik';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/table';
import NumberInputWithButtons from '@/components/NumberInput';
import {validateBetweenZeroAndFive} from '@/utils/validationUtils';

interface ReleasePatternProps {
  releasePattern: number[];
  handleChange: (e: ChangeEvent) => void;
  handleBlur: (e: FocusEvent) => void;
}

const ReleasePatternForm: FC<ReleasePatternProps> = ({releasePattern, handleChange, handleBlur}) => {
  const daysOfWeek = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

  return (
    <Table
      hideHeader
      removeWrapper
      className='table-fixed text-left mb-5'
      aria-labelledby='releaseTable'
    >
      <TableHeader>
        <TableColumn>Dag</TableColumn>
        <TableColumn>Antall</TableColumn>
      </TableHeader>
      <TableBody>
        {daysOfWeek.map((day, index) => (
          <TableRow key={index} className='text-left '>
            <TableCell className='text-lg p-0'>{day}</TableCell>
            <TableCell className='m-2.5 py-0 pr-0 w-full'>
              <Field
                name={`release_pattern[${index}]`}
                value={releasePattern[index]}
                component={NumberInputWithButtons}
                className='input-number-style'
                onChange={handleChange}
                validate={validateBetweenZeroAndFive}
                onBlur={handleBlur}
                minValue={0}
                maxValue={5}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReleasePatternForm;